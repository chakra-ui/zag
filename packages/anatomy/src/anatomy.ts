export const anatomy = (component: string) => {
  let _component = component
  let _parts: string[]

  const api = {
    parts<T extends string>(...parts: T[]) {
      if (_parts) {
        throw new Error("[anatomy] .part(...) should only be called once. Did you mean to use .extend(...) ?")
      }
      _parts = parts
      return api
    },

    extend<T extends string>(...parts: T[]) {
      _parts = [..._parts, ...parts]
      return api
    },

    build() {
      return [...new Set(_parts)].reduce<Record<string, { selector: string }>>(
        (prev, part) =>
          Object.assign(prev, {
            [part]: {
              selector: `[data-scope="${_component}"][data-part="${part}"]`,
            },
          }),
        {},
      )
    },
  }
  return api
}
