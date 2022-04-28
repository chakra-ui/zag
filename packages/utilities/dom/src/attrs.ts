type Booleanish = boolean | "true" | "false"

export const dataAttr = (guard: boolean | undefined) => {
  return (guard ? "" : undefined) as Booleanish
}

export const ariaAttr = (guard: boolean | undefined) => {
  return guard ? true : undefined
}

export const matchAttr = (el: Element) => {
  return {
    get: (key: string) => el.getAttribute(key),
    set: (key: string, value: string) => el.setAttribute(key, value),
    is: (key: string, value: string) => {
      return el.getAttribute(key) === value
    },
  }
}
