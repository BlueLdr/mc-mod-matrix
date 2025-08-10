"use client";

import type { WorkerMessage, WorkerRequest } from "~/data";
import type { Mod } from "@mcmm/data";

//================================================

export class DataRegistryWorkerApi {
  constructor(commonMods?: Mod["id"][]) {
    this.worker = new window.Worker("/workers/worker.js");
    this.listeners = {};
    this.sendRequest({ type: "init", modsToAutoRefresh: commonMods });
    this.worker.addEventListener("message", this.handleMessage);
  }

  private worker: Worker;
  private listeners: Partial<{
    [Type in WorkerMessage as Type["type"]]: Record<string, ((data: Type) => void)[]>;
  }> = {};

  //================================================

  public terminate = () => {
    this.worker.terminate();
  };

  public sendRequest = (request: WorkerRequest) => {
    this.worker.postMessage(request);
  };

  private handleMessage = (e: MessageEvent<WorkerMessage>) => {
    if (!e.data) {
      return;
    }
    if (e.data.message) {
      console.log(`[DataRegistry Worker]`, e.data.message);
    }

    this.listeners[e.data.type]?.[`${e.data.packId}`]?.forEach(callback => callback(e.data as any));
  };

  //================================================

  public on = <T extends WorkerMessage>(
    type: T["type"],
    packId: T["packId"],
    callback: (data: T & WorkerMessage) => void,
  ) => {
    if (!this.listeners[type]) {
      this.listeners[type] = {};
    }
    if (!this.listeners[type][`${packId}`]) {
      this.listeners[type][`${packId}`] = [];
    }
    this.listeners[type][`${packId}`].push(callback);
  };

  public off = <T extends WorkerMessage>(
    type: T["type"],
    packId: T["packId"],
    callback: (data: T & WorkerMessage) => void,
  ) => {
    const callbacks = this.listeners[type]?.[`${packId}`];
    if (!callbacks) {
      return;
    }
    callbacks.splice(callbacks.indexOf(callback), 1);
  };
}
