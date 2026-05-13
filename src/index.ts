import { env } from "@/env.js";
import { createApp } from "@/app.js";

export const app = createApp();
const port = env.PORT;

const color = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

const banner = String.raw`
  _____                                    
 | ____|_  ___ __  _ __ ___  ___ ___
 |  _| \ \/ / '_ \| '__/ _ \/ __/ __|
 | |___ >  <| |_) | | |  __/\__ \__ \ 
 |_____/_/\_\ .__/|_|  \___||___/___/
            |_|                                             
`;

const formatRow = (label: string, value: string) => `| ${label.padEnd(12)} | ${value}`;

const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`${color.cyan}${banner}${color.reset}`);
  console.log(`${color.green}Server ready${color.reset}`);
  console.log(`${color.dim}+--------------+------------------------------${color.reset}`);
  console.log(`${color.cyan}${formatRow("URL", `http://localhost:${port}`)}${color.reset}`);
  console.log(`${color.yellow}${formatRow("Env", env.NODE_ENV ?? "development")}${color.reset}`);
  console.log(`${color.dim}${formatRow("Env source", env.ENV_SOURCE ?? "process env")}${color.reset}`);
  console.log(`${color.dim}+--------------+------------------------------${color.reset}`);
  /* eslint-enable no-console */
});

server.on("error", (err) => {
  /* eslint-disable no-console */
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`${color.red}Port ${env.PORT} is already in use.${color.reset}`);
    console.error("Choose another port or stop the process using it.");
  } else {
    console.error(`${color.red}Failed to start server:${color.reset}`, err);
  }
  /* eslint-enable no-console */
  process.exit(1);
});
