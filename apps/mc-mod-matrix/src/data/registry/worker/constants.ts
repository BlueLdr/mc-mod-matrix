const _cache_lifespan = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_CACHE_LIFESPAN);
export const DATA_REGISTRY_CACHE_LIFESPAN = isNaN(_cache_lifespan)
  ? 1000 * 60 * 60 * 24
  : _cache_lifespan;

const _refresh_interval = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_INTERVAL);
export const DATA_REGISTRY_REFRESH_INTERVAL = isNaN(_refresh_interval)
  ? 1000 * 60 * 10
  : _refresh_interval;

const _fetch_interval = Number(process.env.NEXT_PUBLIC_MCMM_DATA_REGISTRY_REFRESH_FETCH_INTERVAL);
export const DATA_REGISTRY_FETCH_INTERVAL = isNaN(_fetch_interval) ? 1000 : _fetch_interval;
