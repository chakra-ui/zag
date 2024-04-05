export function getMinValueAtIndex(index: number, values: number[], minValue: number) {
  return index === 0 ? minValue : values[index - 1]
}

export function getMaxValueAtIndex(index: number, values: number[], maxValue: number) {
  return index === values.length - 1 ? maxValue : values[index + 1]
}

export function isValueAtMax(value: number, maxValue: number) {
  return value >= maxValue
}

export function isValueAtMin(value: number, minValue: number) {
  return value <= minValue
}

export function isValueWithinRange(value: number, minValue: number, maxValue: number) {
  return value >= minValue && value <= maxValue
}

export function getRoundedValue(value: number, minValue: number, step: number) {
  return Math.round((value - minValue) / step) * step + minValue
}

export function clampValue(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue)
}

export function getValuePercent(value: number, minValue: number, maxValue: number) {
  return (value - minValue) / (maxValue - minValue)
}

export function getPercentValue(percent: number, minValue: number, maxValue: number, step: number) {
  const value = percent * (maxValue - minValue) + minValue
  const roundedValue = getRoundedValue(value, minValue, step)
  return clampValue(roundedValue, minValue, maxValue)
}

export function roundToStepPrecision(value: number, step: number) {
  let roundedValue = value
  let stepString = step.toString()
  let pointIndex = stepString.indexOf(".")
  let precision = pointIndex >= 0 ? stepString.length - pointIndex : 0
  if (precision > 0) {
    let pow = Math.pow(10, precision)
    roundedValue = Math.round(roundedValue * pow) / pow
  }
  return roundedValue
}

export function snapValueToStep(value: number, min: number | undefined, max: number | undefined, step: number): number {
  min = Number(min)
  max = Number(max)
  let remainder = (value - (isNaN(min) ? 0 : min)) % step
  let snappedValue = roundToStepPrecision(
    Math.abs(remainder) * 2 >= step ? value + Math.sign(remainder) * (step - Math.abs(remainder)) : value - remainder,
    step,
  )

  if (!isNaN(min)) {
    if (snappedValue < min) {
      snappedValue = min
    } else if (!isNaN(max) && snappedValue > max) {
      snappedValue = min + Math.floor(roundToStepPrecision((max - min) / step, step)) * step
    }
  } else if (!isNaN(max) && snappedValue > max) {
    snappedValue = Math.floor(roundToStepPrecision(max / step, step)) * step
  }

  // correct floating point behavior by rounding to step precision
  snappedValue = roundToStepPrecision(snappedValue, step)

  return snappedValue
}

function setValueAtIndex<T>(values: T[], index: number, value: T) {
  if (values[index] === value) return values
  return [...values.slice(0, index), value, ...values.slice(index + 1)]
}

type RangeContext = {
  min: number
  max: number
  step: number
  values: number[]
}

export function getValueSetterAtIndex(index: number, ctx: RangeContext) {
  const minValueAtIndex = getMinValueAtIndex(index, ctx.values, ctx.min)
  const maxValueAtIndex = getMaxValueAtIndex(index, ctx.values, ctx.max)
  let nextValues = ctx.values.slice()

  return function setValue(value: number) {
    let nextValue = snapValueToStep(value, minValueAtIndex, maxValueAtIndex, ctx.step)
    nextValues = setValueAtIndex(nextValues, index, value)
    nextValues[index] = nextValue
    return nextValues
  }
}

export function getNextStepValue(index: number, ctx: RangeContext) {
  const nextValue = ctx.values[index] + ctx.step
  return getValueSetterAtIndex(index, ctx)(nextValue)
}

export function getPreviousStepValue(index: number, ctx: RangeContext) {
  const nextValue = ctx.values[index] - ctx.step
  return getValueSetterAtIndex(index, ctx)(nextValue)
}

export function getClosestValueIndex(values: number[], targetValue: number) {
  let targetIndex = values.findIndex((value) => targetValue - value < 0)

  // If the index is zero then the closetThumb is the first one
  if (targetIndex === 0) {
    return targetIndex
  }

  // If no index is found they've clicked past all the thumbs
  if (targetIndex === -1) {
    return values.length - 1
  }

  let valueBefore = values[targetIndex - 1]
  let valueAfter = values[targetIndex]

  // Pick the last left/start thumb, unless they are stacked on top of each other, then pick the right/end one
  if (Math.abs(valueBefore - targetValue) < Math.abs(valueAfter - targetValue)) {
    return targetIndex - 1
  }

  return targetIndex
}

export function getValueRanges(values: number[], minValue: number, maxValue: number, gap: number) {
  return values.map((value, index) => {
    const min = index === 0 ? minValue : values[index - 1] + gap
    const max = index === values.length - 1 ? maxValue : values[index + 1] - gap
    return { min, max, value }
  })
}

export function getValueTransformer(valueA: number[], valueB: number[]) {
  const input = { min: valueA[0], max: valueA[1] }
  const output = { min: valueB[0], max: valueB[1] }

  return function getValue(value: number) {
    if (input.min === input.max || output.min === output.max) return output.min
    const ratio = (output.max - output.min) / (input.max - input.min)
    return output.min + ratio * (value - input.min)
  }
}

export function toFixedNumber(value: number, digits = 0, base: number = 10): number {
  const pow = Math.pow(base, digits)
  return Math.round(value * pow) / pow
}

export function mod(value: number, modulo: number) {
  return ((value % modulo) + modulo) % modulo
}
