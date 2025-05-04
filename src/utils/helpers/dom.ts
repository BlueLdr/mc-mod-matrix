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
  includeBase = true
): string => {
  if (Array.isArray(modifiers)) {
    return modifiers.reduce(
      (str, mod) => `${str ? `${str} ` : ""}${className}${mod}`,
      includeBase ? className : ""
    );
  }
  return Object.entries(modifiers).reduce(
    (str, [mod, active]) =>
      !active ? str : `${str ? `${str} ` : ""}${className}${mod}`,
    includeBase ? className : ""
  );
};

export const classNames = (...names: (string | undefined)[]): string =>
  names.filter(n => !!n?.trim()).join(" ");
