export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;

  cancel(): void;
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): DebouncedFunc<T> => {
  let timer: any = null;
  const invoke: DebouncedFunc<T> = (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func(...args);
      timer = null;
    }, delay);
  };
  invoke.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return invoke;
};
