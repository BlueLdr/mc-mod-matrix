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

//================================================

export const awaitTimeout = (delay: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => resolve(), delay);
  });

//================================================

export const pluralize = (word: string, count: number) => {
  if (count === 1) {
    return word;
  }
  if (word.endsWith("y")) {
    return word.replace(/y$/, "ies");
  }
  if (word.endsWith("s")) {
    return `${word}es`;
  }
  return `${word}s`;
};
