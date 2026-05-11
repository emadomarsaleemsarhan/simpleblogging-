import { spawn } from "node:child_process";

const port = process.env.PORT ?? "3000";

await run("npx", ["prisma", "migrate", "deploy"]);
await run("npx", ["next", "start", "-p", port], { inherit: true });

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
