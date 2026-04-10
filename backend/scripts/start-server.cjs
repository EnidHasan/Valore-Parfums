const { spawn } = require("child_process");

const port = process.env.PORT || "3001";
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
