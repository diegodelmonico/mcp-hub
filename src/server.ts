import express from "express";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const PORT = Number(process.env.PORT ?? 3001);

function createServer() {
  const server = new McpServer({
    name: "mcp-hub",
    version: "1.0.0",
  });

  server.tool(
    "ping",
    "Testa se o MCP Hub está funcionando",
    {},
    async () => ({
      content: [
        {
          type: "text",
          text: "pong",
        },
      ],
    }),
  );

  return server;
}

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mcp-hub",
  });
});

app.post("/mcp", async (req, res) => {
  const server = createServer();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);

  await transport.handleRequest(req, res, req.body);
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    error: "Method not allowed",
  });
});

app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    error: "Method not allowed",
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`MCP Hub rodando em http://127.0.0.1:${PORT}/mcp`);
  console.log(`Health check em http://127.0.0.1:${PORT}/health`);
});