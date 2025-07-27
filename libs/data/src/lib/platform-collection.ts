import type { PlatformModMetadata } from "./types";

//================================================

export class PlatformModMetadataCollection extends Array<PlatformModMetadata> {
  get<P extends PlatformModMetadata["platform"]>(platform: P) {
    return this.find((item): item is PlatformModMetadata<P> => item.platform === platform);
  }

  has(platform: PlatformModMetadata["platform"]) {
    return !!this.get(platform);
  }

  set(meta: PlatformModMetadata) {
    const index = this.findIndex(item => item.platform == meta.platform);
    if (index >= 0) {
      this[index] = meta;
    } else {
      this.push(meta);
    }
  }

  remove(platform: PlatformModMetadata["platform"]) {
    const index = this.findIndex(item => item.platform == platform);
    if (index >= 0) {
      return this.splice(index, 1);
    }
    return;
  }

  clone() {
    return new PlatformModMetadataCollection(...this.slice());
  }

  merge(items: PlatformModMetadata[]) {
    const newThis = this.clone();
    items.forEach(item => {
      newThis.set(item);
    });
    return newThis;
  }

  override push(...items: PlatformModMetadata[]) {
    items = items.filter(item => !this.has(item.platform));
    return super.push(...items);
  }

  override unshift(...items: PlatformModMetadata[]) {
    items = items.filter(item => !this.has(item.platform));
    return super.unshift(...items);
  }
}
