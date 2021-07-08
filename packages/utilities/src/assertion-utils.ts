export function isNumber(value: unknown): value is number {
  return typeof value === "number"
}

export function isNumeric(value: unknown): value is number {
  return isNumber(value) || !Number.isNaN(value) || Number.isFinite(value)
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

export function isRefObject(value: unknown): value is { current: unknown } {
  return isObject(value) && "current" in value
}

export function isString(value: unknown): value is string {
  return typeof value === "string"
}

export const isInputEvent = (
  event: unknown,
): event is { target: HTMLInputElement } =>
  event != null &&
  isObject(event) &&
  "target" in event &&
  event.target instanceof HTMLInputElement

export const isRightClickEvent = (event: unknown) =>
  isMouseEvent(event) && event.button !== 0

export const isTouchEvent = (event: unknown): event is TouchEvent =>
  Boolean(event instanceof TouchEvent && event.touches)

export const isMouseEvent = (event: unknown): event is MouseEvent =>
  // PointerEvent inherits from MouseEvent so we can't use a straight instanceof check.
  isPointerEvent(event)
    ? event.pointerType === "mouse"
    : event instanceof MouseEvent

export const isMultiTouchEvent = (event: unknown) =>
  isTouchEvent(event) && event.touches.length > 1

export const isPointerEvent = (event: unknown): event is PointerEvent =>
  typeof PointerEvent !== "undefined" && event instanceof PointerEvent
