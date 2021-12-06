const platform = (v: RegExp) => isDom() && v.test(navigator.platform)
const ua = (v: RegExp) => isDom() && v.test(navigator.userAgent)

export const isDev = () => process.env.NODE_ENV !== "production"
export const isDom = () => !!(typeof window !== "undefined")
export const isMac = () => platform(/^Mac/)
export const isIPhone = () => platform(/^iPhone/)
export const isIPad = () => platform(/^iPad/) || (isMac() && navigator.maxTouchPoints > 1)
export const isIos = () => isIPhone() || isIPad()
export const isSafari = () => ua(/^((?!chrome|android).)*safari/i)
export const isFirefox = () => ua(/^Firefox/)
export const isWebkit = () => ua(/^WebKit/) && !ua(/Chrome/)
export const isApple = () => isMac() || isIos()

export const isArray = (v: any): v is any[] => Array.isArray(v)
export const isBoolean = (v: any): v is boolean => v === true || v === false
export const isObject = (v: any): v is Record<string, any> => !(v == null || typeof v !== "object" || isArray(v))
export const isNumber = (v: any): v is number => typeof v === "number" && !Number.isNaN(v)
export const isString = (v: any): v is string => typeof v === "string"
export const isFunction = (v: any): v is Function => typeof v === "function"

export const supportsPointerEvent = () => isDom() && window.onpointerdown === null
export const supportsTouchEvent = () => isDom() && window.ontouchstart === null
export const supportsMouseEvent = () => isDom() && window.onmousedown === null

export const isMouseEvent = (v: any): v is MouseEvent => isObject(v) && "button" in v
export const isTouchEvent = (v: any): v is TouchEvent => isObject(v) && "touches" in v
export const isLeftClick = (v: MouseEvent | PointerEvent) => v.button === 0
export const isRightClick = (v: MouseEvent | PointerEvent) => v.button === 2
export const isModifiedEvent = (v: MouseEvent | PointerEvent | KeyboardEvent) =>
  v.ctrlKey || v.altKey || v.metaKey || v.shiftKey
export const isCtrlKey = (v: KeyboardEvent) => (isMac() ? v.metaKey && !v.ctrlKey : v.ctrlKey && !v.metaKey)
