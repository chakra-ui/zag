export function isNumber(value: unknown): value is number {
  return typeof value === "number"
}

export function isNumeric(value: unknown): value is number {
  return isNumber(value) || !Number.isNaN(value) || Number.isFinite(value)
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean"
}

export function isArray(value: unknown): value is any[] {
  return Array.isArray(value)
}

export function isDecimal(value: string | number) {
  return !Number.isInteger(Number.parseFloat(value.toString()))
}

export function isFunction(value: unknown): value is Function {
  return typeof value === "function"
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
}

export function isObjectEmpty(value: unknown) {
  return isObject(value) && Object.keys(value).length === 0
}

export function isRefObject(value: unknown): value is { current: unknown } {
  return isObject(value) && "current" in value
}

export function isString(value: unknown): value is string {
  return typeof value === "string"
}
