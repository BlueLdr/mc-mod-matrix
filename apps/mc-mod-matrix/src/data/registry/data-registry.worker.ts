import { DataRegistryWorker } from "./worker/worker";

import type { Worker } from "./worker";

//================================================

if (typeof globalThis !== "undefined" && "Worker" in globalThis) {
  const worker: { current: DataRegistryWorker | null } = { current: null };
  addEventListener("message", (e: MessageEvent<Worker.Request>) => {
    if (e.data.type === "init" && !worker.current) {
      worker.current = new DataRegistryWorker(e.data.modsToAutoRefresh, e.data.allGameVersions);
    }
  });
}
