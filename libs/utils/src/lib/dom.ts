/**
 * Takes a base className and appends modifiers to it
 *
 * @param className Base className to append modifiers to
 * @param modifiers either a dictionary of booleans, or an array of strings;
 * when an array of strings is provided, all strings in the array are used;
 * when a dict of booleans is provided, keys of the dict whose corresponding
 * values are truthy are used
 * @param [includeBase=true] If `true`, the base className is also included in
 * the output, without any modifiers appended
 *
 *
 */
export const classNameWithModifiers = (
  className: string,
  modifiers: { [key: string]: boolean } | string[],
  includeBase = true,
): string => {
  if (Array.isArray(modifiers)) {
    return modifiers.reduce(
      (str, mod) => `${str ? `${str} ` : ""}${className}${mod}`,
      includeBase ? className : "",
    );
  }
  return Object.entries(modifiers).reduce(
    (str, [mod, active]) => (!active ? str : `${str ? `${str} ` : ""}${className}${mod}`),
    includeBase ? className : "",
  );
};

export const classNames = (...names: (string | undefined)[]): string =>
  names.filter(n => n?.trim()).join(" ");

//================================================

export const stripCalcString = (value: string | number | undefined) => {
  if (!value) {
    return undefined;
  }
  // if it's a number, add units
  if (typeof value === "number") {
    return `${value}px`;
  }
  // if it's a calc() string, strip the calc() and get the expression inside
  const str = value
    .replace(/^calc\((.*)\)$/, "$1")
    .replace(/^\((.*)\)$/, "$1")
    .trim();
  // if it's zero, discard it
  if (!str || /^0(%|[a-z]*)?$/.test(str)) {
    return undefined;
  }
  // if it contains a math operation, wrap it in parentheses
  return /[+/*]/g.test(str) || (/^.+-/g.test(str) && !/^var\(--[^)]+\)$/.test(str))
    ? `(${str})`
    : str;
};

export const makeCalcString = (...values: (string | number | undefined)[]) => {
  const expression = values
    .map(stripCalcString)
    .filter(str => !!str)
    .join(" + ");
  return expression ? `calc(${expression})` : "0";
};
