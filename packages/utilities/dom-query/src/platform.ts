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

const IPHONE_REGEX = /^iPhone/i
const IPAD_REGEX = /^iPad/i
const MAC_REGEX = /^Mac/i
const APPLE_VENDOR_REGEX = /apple/i
const FIREFOX_REGEX = /Firefox/i
const CHROME_REGEX = /Chrome/i
const WEBKIT_REGEX = /AppleWebKit/i
const ANDROID_REGEX = /Android/i
// Desktop Linux + ChromeOS ("Chrome OS" via userAgentData.platform). Android is excluded.
const LINUX_PLATFORM_REGEX = /^(Linux|CrOS|Chrome ?OS|Chromium ?OS)/i

export const isTouchDevice = () => isDom() && !!navigator.maxTouchPoints
export const isIPhone = () => pt(IPHONE_REGEX)
export const isIPad = () => pt(IPAD_REGEX) || (isMac() && navigator.maxTouchPoints > 1)
export const isIos = () => isIPhone() || isIPad()
export const isApple = () => isMac() || isIos()

export const isMac = () => pt(MAC_REGEX)
export const isSafari = () => isApple() && vn(APPLE_VENDOR_REGEX)
export const isFirefox = () => ua(FIREFOX_REGEX)
export const isChrome = () => ua(CHROME_REGEX)
export const isWebKit = () => ua(WEBKIT_REGEX) && !isChrome()
export const isAndroid = () => ua(ANDROID_REGEX)
export const isLinux = () => pt(LINUX_PLATFORM_REGEX) && !isAndroid()
