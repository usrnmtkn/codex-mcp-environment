#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const serverName = process.env.MCP_SERVER_NAME ?? "codex-mcp-environment";

const server = new McpServer({
  name: serverName,
  version: "0.1.0"
});

server.tool(
  "health_check",
  "Confirm that the MCP server is reachable.",
  {},
  async () => ({
    content: [
      {
        type: "text",
        text: `${serverName} is running.`
      }
    ]
  })
);

server.tool(
  "echo",
  "Echo a short message back through MCP.",
  {
    message: z.string().min(1).describe("Message to echo.")
  },
  async ({ message }) => ({
    content: [
      {
        type: "text",
        text: message
      }
    ]
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
