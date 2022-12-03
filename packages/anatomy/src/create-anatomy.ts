import { isEmpty } from "@zag-js/utils"

export type Anatomy<T extends string> = {
  parts: <U extends string>(...parts: U[]) => Omit<Anatomy<U>, "parts">
  extend: <V extends string>(...parts: V[]) => Omit<Anatomy<T | V>, "parts">
  build: () => Record<T, { selector: string }>
}

export const createAnatomy = <T extends string>(name: string, parts = [] as T[]): Anatomy<T> => ({
  parts: <U extends string>(...values: U[]): Omit<Anatomy<U>, "parts"> => {
    if (isEmpty(parts)) {
      return createAnatomy(name, values)
    }
    throw new Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extend(...) ?")
  },
  extend: <V extends string>(...values: V[]): Omit<Anatomy<T | V>, "parts"> =>
    createAnatomy(name, [...parts, ...values]),
  build: () =>
    [...new Set(parts)].reduce<Record<string, { selector: string }>>(
      (prev, part) =>
        Object.assign(prev, {
          [part]: {
            selector: `[data-scope="${name}"][data-part="${part}"]`,
          },
        }),
      {},
    ),
})
