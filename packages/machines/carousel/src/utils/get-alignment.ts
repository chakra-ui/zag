import { isNumber } from "@zag-js/utils"

export type AlignmentOptionType = "start" | "center" | "end" | number

export const getAlignment = (align: AlignmentOptionType, containerSize: number) => {
  const predefined = { start, center, end }

  function start(): number {
    return 0
  }

  function center(n: number): number {
    return end(n) / 2
  }

  function end(n: number): number {
    return containerSize - n
  }

  function percent(): number {
    return containerSize * Number(align)
  }

  return (n: number) => {
    if (isNumber(align)) return percent()
    return predefined[align](n)
  }
}
