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

const _requestThrottleInterval = Number(
  process.env["NEXT_PUBLIC_PLATFORM_EXPORT_FILE_REQUEST_INTERVAL"],
);
export const WORKER_EXPORT_REQUEST_THROTTLE_INTERVAL = isNaN(_requestThrottleInterval)
  ? 200
  : _requestThrottleInterval;

const _requestRetryCount = Number(
  process.env["NEXT_PUBLIC_PLATFORM_EXPORT_FILE_REQUEST_RETRY_COUNT"],
);
export const WOERKER_EXPORT_REQUEST_RETRY_COUNT = isNaN(_requestRetryCount)
  ? 1
  : _requestRetryCount;
