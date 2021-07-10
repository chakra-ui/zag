export const __DEV__ = process.env.NODE_ENV !== "production"

export const __TEST__ = process.env.NODE_ENV === "test"

export const isBrowser = () =>
  !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  )

export const supportsPointerEvents = () =>
  isBrowser() && window.onpointerdown === null

export const supportsTouchEvents = () =>
  isBrowser() && window.ontouchstart === null

export const supportsMouseEvents = () =>
  isBrowser() && window.onmousedown === null

const ua = (regex: RegExp) =>
  isBrowser() && regex.test(window.navigator.userAgent)

const vendor = (regex: RegExp) =>
  isBrowser() && regex.test(window.navigator.vendor)

const platform = (regex: RegExp) =>
  isBrowser() && regex.test(window.navigator.platform)

export const isIOS = () => platform(/(iPhone|iPod|iPad)/i)

export const isMacOS = () => platform(/Mac/)
export const isAppleDevice = () => isMacOS() || isIOS()

// iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
export const isIPad = () =>
  platform(/^iPad/) || (isMacOS() && navigator.maxTouchPoints > 1)

export const isAndroid = () => ua(/Android/)
export const isIPhone = () => platform(/^iPhone/)

export const isChrome = () => ua(/Chrome/)
export const isSafari = () => ua(/Safari/) && vendor(/Apple Computer/)
export const isFirefox = () => ua(/Firefox\/\d+\.\d+$/)
export const isEdge = () => ua(/Edg\//)

export const isWebKit = () => ua(/AppleWebKit/) && !isChrome() && !isEdge()

export const isTablet = () => ua(/(tablet)|(iPad)|(Nexus 9)/i)
export const isMobile = () => ua(/(mobi)/i)

export const getDeviceType = () => {
  if (isTablet()) return "tablet"
  if (isMobile()) return "mobile"
  return "desktop"
}
