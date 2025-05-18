/** Type guard for declaring props of a Next.js page component */
export type PageProps<
  Params extends Record<string, string | string[]> = Record<string, string | string[]>,
  SearchParams extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
};
