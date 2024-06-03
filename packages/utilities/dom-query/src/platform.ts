export const isDom = () => typeof document !== "undefined"

export function getPlatform() {
  const agent = (navigator as any).userAgentData
  return agent?.platform ?? navigator.platform
}

const pt = (v: RegExp) => isDom() && v.test(getPlatform())
const ua = (v: RegExp) => isDom() && v.test(navigator.userAgent)
const vn = (v: RegExp) => isDom() && v.test(navigator.vendor)

export const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints
export const isMac = () => pt(/^Mac/)
export const isSafari = () => isApple() && vn(/apple/i)
export const isFirefox = () => ua(/firefox\//i)
export const isApple = () => pt(/mac|iphone|ipad|ipod/i)
export const isIos = () => pt(/iP(hone|ad|od)|iOS/)
export const isWebKit = () => ua(/AppleWebKit/)

export const isModKey = (event: Pick<KeyboardEvent, "metaKey" | "ctrlKey">) =>
  isApple() ? event.metaKey : event.ctrlKey
