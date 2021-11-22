import { formatter } from "./number-format"

type Num<T extends string> = Record<T, number>

export const transform = (a: [number, number], b: [number, number]) => {
  const i = { min: a[0], max: a[1] }
  const o = { min: b[0], max: b[1] }
  return (v: number) => {
    if (i.min === i.max || o.min === o.max) return o.min
    const ratio = (o.max - o.min) / (i.max - i.min)
    return o.min + ratio * (v - i.min)
  }
}

export function toRanges(o: Num<"min" | "max"> & { value: number[]; spacing: number }) {
  const spacing = o.spacing ?? 0
  return o.value.map((v, i) => {
    const min = i === 0 ? o.min : o.value[i - 1] + spacing
    const max = i === o.value.length - 1 ? o.max : o.value[i + 1] - spacing
    return { min, max, value: v }
  })
}

export function toRangeArray(o: Num<"min" | "max" | "step">): number[] {
  let i = o.min
  const range: number[] = []
  while (i <= o.max) {
    range.push(i)
    i = formatter(i + o.step)
  }
  return range
}
