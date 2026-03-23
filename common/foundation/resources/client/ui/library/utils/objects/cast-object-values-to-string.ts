export function castObjectValuesToString<T extends Record<string, unknown>>(
  obj: T,
): {
  [K in keyof T]: T[K] extends string ? T[K] : string;
} {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, String(value)]),
  ) as {
    [K in keyof T]: T[K] extends string ? T[K] : string;
  };
}
