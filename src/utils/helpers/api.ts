export const shouldForwardHeader = (key: string) =>
  !key.startsWith("cache-") && !key.startsWith("x-forwarded");
