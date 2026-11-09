export interface ViewportSize {
  width: number
  height: number
}

export function getViewportSizeStyle(size: ViewportSize | null) {
  if (!size) return {}
  return {
    "--viewport-width": `${size.width}px`,
    "--viewport-height": `${size.height}px`,
    width: "var(--viewport-width)",
    height: "var(--viewport-height)",
  }
}
