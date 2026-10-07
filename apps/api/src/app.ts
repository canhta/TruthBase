import { runtimeStatus } from "@truthbase/core/runtime";
import Fastify from "fastify";

export function createApp() {
  const app = Fastify({
    ajv: {
      customOptions: {
        coerceTypes: false,
        useDefaults: false,
        removeAdditional: false,
      },
    },
  });
  app.get("/health", () => runtimeStatus());
  return app;
}
