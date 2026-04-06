export interface AnatomyPart {
  selector: string
  attr: string
  attrs: (uid: string | undefined) => Record<string, string>
}

export type AnatomyInstance<T extends string> = Omit<Anatomy<T>, "parts">

export type AnatomyPartName<T> = T extends AnatomyInstance<infer U> ? U : never

export interface Anatomy<T extends string> {
  parts: <U extends string>(...parts: U[]) => AnatomyInstance<U>
  extendWith: <V extends string>(...parts: V[]) => AnatomyInstance<T | V>
  build: () => Record<T, AnatomyPart>
  rename: (newName: string) => Anatomy<T>
  keys: () => T[]
  omit: <U extends T>(...values: U[]) => AnatomyInstance<Exclude<T, U>>
}

export const createAnatomy = <T extends string>(name: string, parts = [] as T[]): Anatomy<T> => ({
  parts: (...values) => {
    if (isEmpty(parts)) {
      return createAnatomy(name, values)
    }
    throw new Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?")
  },
  extendWith: (...values) => createAnatomy(name, [...parts, ...values]),
  omit: <U extends T>(...values: U[]) =>
    createAnatomy(name, parts.filter((part) => !values.includes(part as U)) as Exclude<T, U>[]),
  rename: (newName) => createAnatomy(newName, parts),
  keys: () => parts,
  build: () =>
    [...new Set(parts)].reduce<Record<string, AnatomyPart>>((prev, part) => {
      const attrName = `data-${toKebabCase(name)}-${toKebabCase(part)}`
      return Object.assign(prev, {
        [part]: {
          selector: [`&[${attrName}]`, `& [${attrName}]`].join(", "),
          attr: attrName,
          attrs: (uid: string | undefined) => {
            if (uid == null) throw new Error(`[zag-js] Cannot spread anatomy attrs without a uid for "${attrName}"`)
            return { [attrName]: uid }
          },
        },
      })
    }, {}),
})

const toKebabCase = (value: string) =>
  value
    .replace(/([A-Z])([A-Z])/g, "$1-$2")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()

const isEmpty = <T>(v: T[]): boolean => v.length === 0
