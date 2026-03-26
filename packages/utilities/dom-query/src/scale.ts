export function getScale(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  const offsetWidth = element.offsetWidth
  const offsetHeight = element.offsetHeight

  // Use Math.round to detect real CSS transforms vs subpixel rendering differences
  // (same technique as floating-ui)
  const hasTransform = Math.round(rect.width) !== offsetWidth || Math.round(rect.height) !== offsetHeight

  let x = hasTransform ? Math.round(rect.width) / offsetWidth : 1
  let y = hasTransform ? Math.round(rect.height) / offsetHeight : 1

  if (!x || !Number.isFinite(x)) x = 1
  if (!y || !Number.isFinite(y)) y = 1

  return { x, y }
}
