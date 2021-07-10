import { countDecimals, toFixed } from "./number"

type RangeTuple = [min: number, max: number]

type ValuesToRangesOptions = {
  min: number
  max: number
  value: number[]
}

export interface RangeOptions {
  min?: number
  max?: number
  precision?: number
  step?: number
  value?: string | number
}

export class Range {
  min: number
  max: number
  precision: number | undefined
  step: number
  value: string | number

  constructor(public options: RangeOptions) {
    const { min = 0, max = 100, precision, step = 1, value = 0 } = options

    if (max < min) {
      throw new RangeError("clamp: max cannot be less than min")
    }

    this.min = min
    this.max = max
    this.precision = precision
    this.step = step
    this.value = value
  }

  /**
   * Converts a string value to a number and strips letters
   */
  static parse(value: string | number) {
    return parseFloat(value.toString().replace(/[^\w.-]+/g, ""))
  }

  /**
   * Transforms numbers into other values by mapping them from an input range to an output range.
   * Returns the type of the input provided.
   *
   * @example
   *
   * ```js
   * const getValue = transform([0, 200], [0, 1])
   * console.log(getValue(100)) // => 0.5
   * ```
   */
  static transform(inputTuple: RangeTuple, outputTuple: RangeTuple) {
    const input = Range.fromTuple(inputTuple)
    const output = Range.fromTuple(outputTuple)

    return (value: number) => {
      if (input.min === input.max || output.min === output.max) {
        return output.min
      }
      const ratio = (output.max - output.min) / (input.max - input.min)
      return output.min + ratio * (value - input.min)
    }
  }

  /**
   * Returns a new range instance based on the specified `[min, max]` range
   */
  static fromTuple(range: RangeTuple) {
    const [min, max] = range
    return new Range({ min, max })
  }

  /**
   * Converts an array of values to an array of ranges
   */
  static valuesToRanges(options: ValuesToRangesOptions) {
    return options.value
      .map((value, index) => [
        options.value[index - 1] ?? options.min,
        options.value[index + 1] ?? options.max,
        value,
      ])
      .map(([min, max, value]) => new Range({ min, max, value }))
  }

  /**
   * Overrides the range's value
   */
  setValue(value: string | number) {
    this.value = value
    return this
  }

  /**
   * Overrides the range's `step` value
   */
  setStep(step: number) {
    this.step = step
    return this
  }

  setToMin() {
    this.value = this.min.toString()
    return this
  }

  setToMax() {
    this.value = this.max.toString()
    return this
  }

  /**
   * Creates a new range instance with new options
   */
  withOptions(options: Partial<RangeOptions>) {
    return new Range({ ...this.options, ...options })
  }

  /**
   * Converts the value (string or number) to a floating-point number.
   */
  valueOf() {
    return Range.parse(this.value)
  }

  /**
   * Converts the value (string or number) to the string.
   * The returned string is rounded to the maximum precision
   */
  toString() {
    const num = this.valueOf()
    return toFixed(num, this.decimalCount)
  }

  /**
   * Converts the value to a percentage value between the `min` and `max`
   */
  toPercent() {
    return ((this.valueOf() - this.min) * 100) / (this.max - this.min)
  }

  /**
   * Returns the instance with a new `value` that is derived from the `percent`
   * value passed.
   */
  fromPercent(percent: number | Range) {
    percent = percent instanceof Range ? percent.valueOf() : percent
    this.value = (this.max - this.min) * percent + this.min
    return this
  }

  /**
   * Returns the range instance with its `value` clamped between `min` and `max`
   */
  clamp(keepWithinRange = true) {
    let nextValue: number | null = this.valueOf()

    if (keepWithinRange) {
      nextValue = Math.min(Math.max(nextValue, this.min), this.max)
    }

    this.value = toFixed(nextValue ?? 0, this.precision)
    return this
  }

  /**
   * Increments the range's value by the specified step
   * @param step The number of steps to increment by
   */
  increment(step = this.step) {
    if (this.value === "") {
      this.value = Range.parse(step)
    } else {
      this.value = this.valueOf() + step
    }
    return this
  }

  /**
   * Decrements the range's value by the specified step
   * @param step The number of steps to decrement by
   */
  decrement(step = this.step) {
    if (this.value === "") {
      this.value = Range.parse(-step)
    } else {
      this.value = this.valueOf() - step
    }
    return this
  }

  /**
   * Rounds the value to the nearest step
   */
  snapToStep(value: number | Range) {
    const current = this.valueOf()
    value = value instanceof Range ? value.valueOf() : value

    const nextValue =
      Math.round((value - current) / this.step) * this.step + current

    const precision = countDecimals(this.step)
    this.value = toFixed(nextValue, precision)

    return this
  }

  /**
   * Resets the range values to the initial
   */
  reset() {
    this.value = this.options.value ?? 0
    this.step = this.options.step ?? 1
    this.min = this.options.min ?? 0
    this.max = this.options.max ?? 100
    this.precision = this.options.precision
    return this
  }

  /**
   * Returns a new copy of the range
   */
  clone() {
    return new Range(this)
  }

  /**
   * Whether the `value` is within the `min` and `max`
   */
  get isInRange() {
    if (this.value === "") return true
    const num = this.valueOf()
    return num <= this.max && num >= this.min
  }

  /**
   * Whether the `value` is at `min`
   */
  get isAtMin() {
    return this.valueOf() === this.min
  }

  /**
   * Whether the `value` is at `max`
   */
  get isAtMax() {
    return this.valueOf() === this.max
  }

  /**
   * Get the decimal count of the range's value
   */
  get decimalCount() {
    const num = this.valueOf()

    const defaultPrecision = isNaN(num)
      ? countDecimals(this.step)
      : Math.max(countDecimals(num), countDecimals(this.step))

    return this.precision ?? defaultPrecision
  }

  /**
   * Makes range instance iterable to support `for..of` loop,
   * spread operator, and `Array.from(...)`
   */
  *[Symbol.iterator]() {
    let current = this.min
    while (current <= this.max) {
      yield current
      current += this.step
    }
  }
}

export function createRange(options: RangeOptions) {
  return new Range(options)
}
