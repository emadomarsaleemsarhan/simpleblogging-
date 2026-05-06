import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = process.env.PORT ?? "3000";

await ensureSqliteFile(process.env.DATABASE_URL);
await run("npx", ["prisma", "migrate", "deploy"]);
await run("npx", ["next", "start", "-p", port], { inherit: true });

async function ensureSqliteFile(databaseUrl) {
  if (!databaseUrl?.startsWith("file:")) {
    return;
  }

  const sqlitePath = sqlitePathFromUrl(databaseUrl);
  await fs.mkdir(path.dirname(sqlitePath), { recursive: true });
  const handle = await fs.open(sqlitePath, "a");
  await handle.close();
}

function sqlitePathFromUrl(databaseUrl) {
  const value = databaseUrl.slice("file:".length);
  if (value.startsWith("/")) {
    return fileURLToPath(databaseUrl);
  }
  return path.resolve(value);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      shell: process.platform === "win32",
      stdio: options.inherit ? "inherit" : "pipe",
      env: process.env,
    });

    let stderr = "";
    if (!options.inherit) {
      child.stdout?.on("data", (chunk) => process.stdout.write(chunk));
      child.stderr?.on("data", (chunk) => {
        stderr += chunk;
        process.stderr.write(chunk);
      });
    }

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
}
