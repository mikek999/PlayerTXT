const sql = require('mssql');

/**
 * StoryInjestor - Handles loading JSON Story Packets into the SQL Database
 */
class StoryInjestor {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
    }

    async injest(storyJson) {
        const pool = await sql.connect(this.dbConfig);
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // 1. Insert World
            const worldResult = await transaction.request()
                .input('name', sql.NVarChar, storyJson.metadata.name)
                .input('desc', sql.NVarChar, storyJson.metadata.description)
                .query('INSERT INTO Worlds (Name, Description) OUTPUT INSERTED.WorldID VALUES (@name, @desc)');

            const worldId = worldResult.recordset[0].WorldID;

            // Mapping for Room Internal Name -> DB RoomID
            const roomMap = {};

            // 2. Insert Rooms (Base Info)
            for (const room of storyJson.seed_data.rooms) {
                const roomResult = await transaction.request()
                    .input('worldId', sql.Int, worldId)
                    .input('internalName', sql.NVarChar, room.internalName)
                    .input('displayName', sql.NVarChar, room.displayName)
                    .input('desc', sql.NVarChar, room.description)
                    .query(`
                        INSERT INTO Rooms (WorldID, InternalName, DisplayName, BaseDescription) 
                        OUTPUT INSERTED.RoomID 
                        VALUES (@worldId, @internalName, @displayName, @desc)
                    `);

                const roomId = roomResult.recordset[0].RoomID;
                roomMap[room.internalName] = roomId;

                // Insert Room Metadata (Plug-ins)
                if (room.metadata) {
                    for (const [key, value] of Object.entries(room.metadata)) {
                        await transaction.request()
                            .input('worldId', sql.Int, worldId)
                            .input('entityId', sql.Int, roomId)
                            .input('type', sql.NVarChar, 'ROOM')
                            .input('key', sql.NVarChar, key)
                            .input('val', sql.NVarChar, value.toString())
                            .query('INSERT INTO EntityMetadata (WorldID, EntityID, EntityType, KeyName, KeyValue) VALUES (@worldId, @entityId, @type, @key, @val)');
                    }
                }
            }

            // 3. Insert Exits (Now that all rooms exist)
            for (const room of storyJson.seed_data.rooms) {
                const sourceId = roomMap[room.internalName];
                for (const exit of room.exits) {
                    const destId = roomMap[exit.targetRoom];
                    if (!destId) continue;

                    await transaction.request()
                        .input('sourceId', sql.Int, sourceId)
                        .input('destId', sql.Int, destId)
                        .input('dir', sql.NVarChar, exit.direction)
                        .input('desc', sql.NVarChar, exit.description)
                        .query('INSERT INTO Exits (SourceRoomID, DestRoomID, Direction, Description) VALUES (@sourceId, @destId, @dir, @desc)');
                }
            }

            // 4. Insert Characters
            for (const char of storyJson.seed_data.characters) {
                const roomId = roomMap[char.startRoom];
                const charResult = await transaction.request()
                    .input('worldId', sql.Int, worldId)
                    .input('name', sql.NVarChar, char.name)
                    .input('goal', sql.NVarChar, char.secretGoal)
                    .input('prompt', sql.NVarChar, char.personaPrompt)
                    .input('roomId', sql.Int, roomId)
                    .input('isAi', sql.Bit, char.isAI ? 1 : 0)
                    .input('tier', sql.Int, char.tier || 1)
                    .query(`
                        INSERT INTO Characters (WorldID, Name, SecretGoal, PersonaPrompt, CurrentRoomID, IsAI, Tier) 
                        OUTPUT INSERTED.CharacterID 
                        VALUES (@worldId, @name, @goal, @prompt, @roomId, @isAi, @tier)
                    `);

                const charId = charResult.recordset[0].CharacterID;

                // Character Metadata
                if (char.metadata) {
                    for (const [key, value] of Object.entries(char.metadata)) {
                        await transaction.request()
                            .input('worldId', sql.Int, worldId)
                            .input('entityId', sql.Int, charId)
                            .input('type', sql.NVarChar, 'CHARACTER')
                            .input('key', sql.NVarChar, key)
                            .input('val', sql.NVarChar, value.toString())
                            .query('INSERT INTO EntityMetadata (WorldID, EntityID, EntityType, KeyName, KeyValue) VALUES (@worldId, @entityId, @type, @key, @val)');
                    }
                }
            }

            // 5. Insert Items
            for (const item of storyJson.seed_data.items) {
                const roomId = roomMap[item.startRoom];
                const itemResult = await transaction.request()
                    .input('worldId', sql.Int, worldId)
                    .input('name', sql.NVarChar, item.name)
                    .input('desc', sql.NVarChar, item.description)
                    .input('roomId', sql.Int, roomId)
                    .input('isCritical', sql.Bit, item.isCritical ? 1 : 0)
                    .input('isHidden', sql.Bit, item.isHidden ? 1 : 0)
                    .query(`
                        INSERT INTO Items (WorldID, Name, Description, InitialRoomID, CurrentRoomID, IsCritical, IsHidden) 
                        OUTPUT INSERTED.ItemID 
                        VALUES (@worldId, @name, @desc, @roomId, @roomId, @isCritical, @isHidden)
                    `);

                const itemId = itemResult.recordset[0].ItemID;

                // Item Metadata
                if (item.metadata) {
                    for (const [key, value] of Object.entries(item.metadata)) {
                        await transaction.request()
                            .input('worldId', sql.Int, worldId)
                            .input('entityId', sql.Int, itemId)
                            .input('type', sql.NVarChar, 'ITEM')
                            .input('key', sql.NVarChar, key)
                            .input('val', sql.NVarChar, value.toString())
                            .query('INSERT INTO EntityMetadata (WorldID, EntityID, EntityType, KeyName, KeyValue) VALUES (@worldId, @entityId, @type, @key, @val)');
                    }
                }
            }

            await transaction.commit();
            console.log(`Successfully injested world: ${storyJson.metadata.name} (ID: ${worldId})`);
            return worldId;

        } catch (err) {
            await transaction.rollback();
            console.error('Injestor failed, rolled back.', err);
            throw err;
        }
    }
}

module.exports = StoryInjestor;
