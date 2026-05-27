# Codex MCP Environment

This is a small starter environment for a local Model Context Protocol server that Codex can run over stdio.

## What is included

- TypeScript MCP server in `src/index.ts`
- `health_check` tool to verify the server is reachable
- `echo` tool as a simple example
- `.env.example` for local configuration
- GitHub-ready package metadata, license, and ignore rules

## Local setup

```bash
npm install
npm run build
npm start
```

For development:

```bash
npm run dev
```

## Add this MCP server to Codex

After installing dependencies and building the project, add an MCP server entry to your Codex config. Adjust the path if you move this folder.

```toml
[mcp_servers.codex_mcp_environment]
command = "node"
args = ["/Users/mprez/Documents/Codex/2026-05-27/help-me-create-a-new-environment/dist/index.js"]
env = { MCP_SERVER_NAME = "codex-mcp-environment" }
```

Then restart Codex so it can load the new MCP server.

## GitHub setup

Once Git is available and GitHub CLI is authenticated:

```bash
git init
git add .
git commit -m "Initial MCP environment"
gh repo create codex-mcp-environment --public --source=. --remote=origin --push
```

If you prefer a private repo, use `--private` instead of `--public`.
