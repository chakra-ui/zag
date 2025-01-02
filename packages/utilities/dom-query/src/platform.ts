export const isDom = () => typeof document !== "undefined"

interface NavigatorUserAgentData {
  brands: Array<{ brand: string; version: string }>
  mobile: boolean
  platform: string
}

export function getPlatform(): string {
  const agent = (navigator as any).userAgentData as NavigatorUserAgentData | undefined
  return agent?.platform ?? navigator.platform
}

export function getUserAgent(): string {
  const ua = (navigator as any).userAgentData as NavigatorUserAgentData | undefined
  if (ua && Array.isArray(ua.brands)) {
    return ua.brands.map(({ brand, version }) => `${brand}/${version}`).join(" ")
  }
  return navigator.userAgent
}

const pt = (v: RegExp) => isDom() && v.test(getPlatform())
const ua = (v: RegExp) => isDom() && v.test(getUserAgent())
const vn = (v: RegExp) => isDom() && v.test(navigator.vendor)

export const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints
export const isMac = () => pt(/^Mac/)
export const isSafari = () => isApple() && vn(/apple/i)
export const isFirefox = () => ua(/firefox\//i)
export const isApple = () => pt(/mac|iphone|ipad|ipod/i)
export const isIos = () => pt(/iP(hone|ad|od)|iOS/)
export const isWebKit = () => ua(/AppleWebKit/)
export const isAndroid = () => {
  const re = /android/i
  return pt(re) || ua(re)
}
