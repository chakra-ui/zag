import {
  decrement,
  getMaxPrecision,
  increment,
  isAtMax,
  isAtMin,
  isWithinRange,
  Num,
  snapToStep,
  round,
  percentToValue,
  clamp,
  valueOf,
  valueToPercent,
} from "./number"

export type RangeOptions<T = string | number> = Num<"min" | "max"> & {
  step: number
  precision?: number
  value: T
}

export function rangy(o: RangeOptions) {
  const wrap = (v: string | number) => rangy({ ...o, value: v })
  return {
    get isInRange() {
      return isWithinRange(o.value, o)
    },
    get isAtMax() {
      return isAtMax(o.value, o)
    },
    get isAtMin() {
      return isAtMin(o.value, o)
    },
    get percent() {
      return valueToPercent(o.value, o)
    },
    get valueAsNumber() {
      return valueOf(o.value)
    },
    get value(): string {
      return this.toPrecision().value
    },
    get precision() {
      return getMaxPrecision(o)
    },
    snapToStep: () => wrap(snapToStep(o.value, o.step)),
    increment: (s?: number) => wrap(increment(o.value, s || o.step)),
    decrement: (s?: number) => wrap(decrement(o.value, s || o.step)),
    toPrecision: () => wrap(round(o.value, getMaxPrecision(o))),
    toMax: () => wrap(o.max),
    toMin: () => wrap(o.min),
    fromPercent: (p: number) => wrap(percentToValue(p, o)),
    clamp: () => wrap(clamp(o.value, o)),
  }
}
