export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

export function toFixedNumber(num: number, digits: number) {
  return Math.round(Math.pow(10, digits) * num) / Math.pow(10, digits)
}

export function clampValue(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
