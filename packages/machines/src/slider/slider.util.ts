export type AlgoritmType = "linear" | "geometric" | "logarithmic"

export type Algorithm = {
  valueToPercent(value: number, min: number, max: number): number
  percentToValue(percent: number, min: number, max: number): number
}

export const geometric: Algorithm = {
  valueToPercent: (value, min, max) => (max / (max - min)) ** 0.5 * ((value - min) / max) ** 0.5 * 100,
  percentToValue: (percent, min, max) => percent ** 2 * (max - min) + min,
}

export const linear: Algorithm = {
  valueToPercent: (value, min, max) => ((value - min) / (max - min)) * 100,
  percentToValue: (percent, min, max) => (max - min) * percent + min,
}

export const logarithmic: Algorithm = {
  valueToPercent(value, min, max) {
    const minv = Number.isFinite(Math.log(min)) ? Math.log(min) : 0
    const maxv = Number.isFinite(Math.log(max)) ? Math.log(max) : 0
    const scale = (maxv - minv) / 100
    const position = (Math.log(value) - minv) / scale
    return Number.isFinite(position) ? position : 0
  },
  percentToValue(percent, min, max) {
    const minv = Number.isFinite(Math.log(min)) ? Math.log(min) : 0
    const maxv = Number.isFinite(Math.log(max)) ? Math.log(max) : 0
    if (percent === 0) return min
    if (percent === 1) return max
    const scale = (maxv - minv) / 100
    return Math.floor(Math.exp(minv + scale * percent * 100)) || 0
  },
}
