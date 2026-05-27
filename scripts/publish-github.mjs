import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const [owner, repo] = process.argv.slice(2);

if (!owner || !repo) {
  console.error("Usage: node scripts/publish-github.mjs <owner> <repo>");
  process.exit(1);
}

const token = execFileSync("gh", ["auth", "token"], {
  encoding: "utf8"
}).trim();

const root = process.cwd();
const ignoredDirs = new Set([".git", "dist", "node_modules"]);

function listFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    if (ignoredDirs.has(entry)) {
      return [];
    }

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return listFiles(fullPath);
    }

    return [fullPath];
  });
}

function githubPath(filePath) {
  return relative(root, filePath)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
}

for (const filePath of listFiles(root)) {
  const path = githubPath(filePath);
  const content = readFileSync(filePath).toString("base64");
  const existing = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "codex-mcp-environment-publisher",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }
  );
  const current = existing.ok ? await existing.json() : undefined;
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "codex-mcp-environment-publisher",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      body: JSON.stringify({
        message: `${current?.sha ? "Update" : "Add"} ${relative(root, filePath)}`,
        content,
        sha: current?.sha
      })
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to upload ${path}: ${response.status} ${body}`);
  }

  console.log(`Uploaded ${relative(root, filePath)}`);
}
