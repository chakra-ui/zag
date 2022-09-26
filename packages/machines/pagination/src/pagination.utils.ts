export const utils = {
  range: (start: number, end: number) => {
    let length = end - start + 1
    return Array.from({ length }, (_, idx) => idx + start)
  },
  transform: (items: (string | number)[]) => {
    return items.map((value) => {
      if (typeof value === "number") return { type: "page", value } as const
      return { type: "dot" } as const
    })
  },
}
