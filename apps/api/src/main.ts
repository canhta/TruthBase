import { createApp } from "./app.js";

const app = createApp();
const address = await app.listen({ host: "127.0.0.1", port: 3000 });
console.log(`TruthBase API listening at ${address}`);

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
  });
}
