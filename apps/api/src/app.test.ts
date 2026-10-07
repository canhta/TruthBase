import { expect, test } from "vitest";
import { createApp } from "./app.js";

test("synthetic health request reaches the API through the core package export", async () => {
  const app = createApp();
  try {
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      service: "truthbase",
      status: "ready",
    });
  } finally {
    await app.close();
  }
});
