import { DataRegistryWorker } from "./worker/worker";

import type { WorkerRequest } from "~/data";

//================================================

if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
  const worker: { current: DataRegistryWorker | null } = { current: null };
  addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
    if (e.data.type === "init" && !worker.current) {
      worker.current = new DataRegistryWorker(e.data.modsToAutoRefresh);
    }
  });
}
