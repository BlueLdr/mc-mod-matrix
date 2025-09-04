"use client";

import { MessageType } from "./types";

import type * as Worker from "./types";
import type { GameVersion, Mod } from "@mcmm/data";

//================================================

export class DataRegistryWorkerApi {
  constructor(commonMods?: Mod["id"][], allGameVersions?: GameVersion[]) {
    this.worker = new window.Worker("/workers/worker.js");
    this.listeners = {};
    this.sendRequest({ type: "init", modsToAutoRefresh: commonMods, allGameVersions });
    this.worker.addEventListener("message", this.handleMessage);
  }

  private worker: Worker;
  private listeners: Partial<{
    [Type in Worker.JobMessage as `${Type["jobType"]}-${Type["type"]}`]: Record<
      string,
      Set<(data: Type) => void>
    >;
  }> = {};

  //================================================

  private getListenerKey = <T extends Worker.JobMessage>(message: Pick<T, "jobType" | "type">) =>
    `${message.jobType}-${message.type}` as const;

  public terminate = () => {
    this.worker.terminate();
  };

  public sendRequest = (request: Worker.Request) => {
    this.worker.postMessage(request);
  };

  private handleMessage = (e: MessageEvent<Worker.JobMessage>) => {
    if (!e.data) {
      return;
    }
    if (e.data.message) {
      console[e.type === MessageType.Error ? "error" : "log"](
        `[DataRegistry Worker]`,
        e.data.message,
      );
    }

    this.listeners[this.getListenerKey(e.data)]?.[`${e.data.id}`]?.forEach(callback =>
      callback(e.data as any),
    );
  };

  //================================================

  public on = <TType extends Worker.MessageType, TJobType extends Worker.JobType>(
    type: TType,
    jobType: TJobType,
    id: Worker.JobMessageWith<TType, TJobType>["id"],
    callback: (data: Worker.JobMessageWith<TType, TJobType>) => void,
    options?: { once?: boolean },
  ) => {
    const key = this.getListenerKey({ type, jobType });
    if (!this.listeners[key]) {
      this.listeners[key] = {};
    }
    if (!this.listeners[key][`${id}`]) {
      this.listeners[key][`${id}`] = new Set<any>();
    }
    if (options?.once) {
      const originalCallback = callback;
      const callbackRef = { current: callback };
      callback = (...args) => {
        originalCallback(...args);
        this.off(type, jobType, id, callbackRef.current);
      };
      callbackRef.current = callback;
    }
    this.listeners[key][`${id}`].add(
      // @ts-expect-error: stupid type narrowing
      callback,
    );
  };

  public off = <TType extends Worker.MessageType, TJobType extends Worker.JobType>(
    type: TType,
    jobType: TJobType,
    id: Worker.JobMessageWith<TType, TJobType>["id"],
    callback: (data: Worker.JobMessageWith<TType, TJobType>) => void,
  ) => {
    const callbacks = this.listeners[this.getListenerKey({ type, jobType })]?.[`${id}`];
    if (!callbacks) {
      return;
    }
    callbacks.delete(
      // @ts-expect-error: stupid type narrowing
      callback,
    );
  };
}
