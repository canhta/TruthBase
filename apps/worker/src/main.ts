import { runtimeStatus } from "@truthbase/core/runtime";

console.log(
  JSON.stringify({ ...runtimeStatus(), process: "worker", jobs: "disabled" }),
);
