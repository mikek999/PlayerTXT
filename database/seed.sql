USE MasqueradeProtocol;
GO

-- Seed an initial "Tutorial" world
INSERT INTO Worlds (Name, Description) VALUES ('The Silent Submarine', 'A 3-hour mystery set on a 1920s submarine submerged in the Atlantic.');

DECLARE @WorldID INT = SCOPE_IDENTITY();

-- Create Rooms
INSERT INTO Rooms (WorldID, InternalName, DisplayName, BaseDescription) VALUES 
(@WorldID, 'torpedo_room', 'Torpedo Room', 'The air is thick with the smell of grease and salt water. Massive torpedo tubes line the walls.'),
(@WorldID, 'control_room', 'Control Room', 'Dials and levers cover every surface. The faint hum of the engine vibrates through the floor.'),
(@WorldID, 'officers_mess', 'Officers Mess', 'A small table is bolted to the floor. A half-eaten meal sits abandoned.');

DECLARE @TorpedoRoomID INT = (SELECT RoomID FROM Rooms WHERE InternalName = 'torpedo_room');
DECLARE @ControlRoomID INT = (SELECT RoomID FROM Rooms WHERE InternalName = 'control_room');
DECLARE @MessID INT = (SELECT RoomID FROM Rooms WHERE InternalName = 'officers_mess');

-- Create Exits
INSERT INTO Exits (SourceRoomID, DestRoomID, Direction, Description) VALUES 
(@TorpedoRoomID, @ControlRoomID, 'NORTH', 'You squeeze through the narrow bulkhead into the control room.'),
(@ControlRoomID, @TorpedoRoomID, 'SOUTH', 'You head back towards the torpedo room.'),
(@ControlRoomID, @MessID, 'EAST', 'A heavy door leads into the mess hall.'),
(@MessID, @ControlRoomID, 'WEST', 'You return to the control room.');

-- Create Characters (A Detective and an AI Understudy)
INSERT INTO Characters (WorldID, Name, SecretGoal, PersonaPrompt, CurrentRoomID, IsAI, Tier) VALUES 
(@WorldID, 'The Captain', 'Maintain order at all costs.', 'You are the stern Captain of this vessel.', @ControlRoomID, 0, 1),
(@WorldID, 'The Cook', 'Hide the stash of stolen jewels.', 'You are the nervous Cook, always looking over your shoulder.', @MessID, 1, 1);

-- Create Items
INSERT INTO Items (WorldID, Name, Description, CurrentRoomID, IsCritical) VALUES 
(@WorldID, 'Wrench', 'A heavy iron wrench, stained with grease.', @TorpedoRoomID, 0),
(@WorldID, 'Captain''s Log', 'A leather-bound book containing navigation notes.', @ControlRoomID, 1);
GO
