export const shouldForwardHeader = (key: string) =>
  !key.startsWith("sec-") && !key.startsWith("cache-") && !key.startsWith("x-forwarded");
