const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios');

/**
 * The Masquerade Protocol MCP Server
 * Bridges the LLM to the Node.js Game Server API
 */
const server = new Server(
    {
        name: "masquerade-engine",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

const API_BASE_URL = process.env.GAME_SERVER_URL || "http://localhost:443/api/v1";

/**
 * List available tools for the AI agent
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "move_player",
                description: "Move the character to a different room",
                inputSchema: {
                    type: "object",
                    properties: {
                        direction: {
                            type: "string",
                            description: "The direction to move (NORTH, SOUTH, EAST, WEST, UP, DOWN)",
                        },
                    },
                    required: ["direction"],
                },
            },
            {
                name: "speak",
                description: "Speak to other characters in the room",
                inputSchema: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "The text to say",
                        },
                    },
                    required: ["message"],
                },
            },
            {
                name: "take_item",
                description: "Pick up an item from the current room",
                inputSchema: {
                    type: "object",
                    properties: {
                        itemName: {
                            type: "string",
                            description: "The name of the item to pick up",
                        },
                    },
                    required: ["itemName"],
                },
            }
        ],
    };
});

/**
 * Handle tool calls from the LLM
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case "move_player":
                // In a real implementation, this would use the player's cookie/session
                return {
                    content: [{ type: "text", text: `Moving ${args.direction}... (Internal API call to ${API_BASE_URL}/action)` }],
                };
            case "speak":
                return {
                    content: [{ type: "text", text: `You say: "${args.message}"` }],
                };
            case "take_item":
                return {
                    content: [{ type: "text", text: `You picked up the ${args.itemName}.` }],
                };
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error.message}` }],
            isError: true,
        };
    }
});

/**
 * List available resources (Room Context, World State)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "game://current_room/description",
                name: "Current Room Description",
                description: "The sensory description of the room the character is in",
            },
            {
                uri: "game://character/dossier",
                name: "Character Dossier",
                description: "Secret goals and persona information for the character",
            }
        ],
    };
});

/**
 * Read resource content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;

    if (uri === "game://current_room/description") {
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/plain",
                    text: "You are in a dimly lit Control Room. Dials and levers cover the walls. A heavy bulkhead leads SOUTH.",
                },
            ],
        };
    }

    throw new Error(`Resource not found: ${uri}`);
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Masquerade MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
