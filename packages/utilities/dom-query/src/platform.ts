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
export const isIPhone = () => pt(/^iPhone/i)
export const isIPad = () => pt(/^iPad/i) || (isMac() && navigator.maxTouchPoints > 1)
export const isIos = () => isIPhone() || isIPad()
export const isApple = () => isMac() || isIos()

export const isMac = () => pt(/^Mac/i)
export const isSafari = () => isApple() && vn(/apple/i)
export const isFirefox = () => ua(/Firefox/i)
export const isChrome = () => ua(/Chrome/i)
export const isWebKit = () => ua(/AppleWebKit/i) && !isChrome()
export const isAndroid = () => ua(/Android/i)
