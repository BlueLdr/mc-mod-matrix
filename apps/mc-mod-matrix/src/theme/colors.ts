export const colorsMeta = {
  common: {
    modrinth: {
      color: "rgb(27, 217, 106)",
      label: "Modrinth Logo",
      labelColor: "black",
    },
    curseforge: {
      color: "rgb(241, 100, 54)",
      label: "Curseforge Logo",
      labelColor: "white",
    },
  },
} as const;

// flatten colorsMeta
type GetColor<T> = {
  [C in keyof T]: T[C] extends { color: string } ? [C, T[C]["color"]] : GetColor<T[C]>;
}[keyof T];
export type Colors = {
  [K in GetColor<typeof colorsMeta> as K[0]]: K[1];
};

export const colors = Object.values(colorsMeta).reduce((acc, colorsObject) => {
  for (const [colorKey, colorObj] of Object.entries(colorsObject)) {
    acc[colorKey] = colorObj.color;
  }
  return acc;
}, {} as any) as Colors;
