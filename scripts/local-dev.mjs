import { spawn } from "node:child_process";

const port = process.env.PORT ?? process.argv[2] ?? "52344";
const nextAuthUrl = process.env.NEXTAUTH_URL ?? `http://localhost:${port}`;

const child = spawn("npx", ["next", "dev", "-p", port], {
  shell: process.platform === "win32",
  stdio: "inherit",
  env: {
    ...process.env,
    NEXTAUTH_URL: nextAuthUrl,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
