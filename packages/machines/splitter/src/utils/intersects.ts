/**
 * Check if two rectangles intersect.
 * Based on react-resizable-panels
 * @see https://github.com/bvaughn/react-resizable-panels
 */

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Check if two rectangles intersect.
 * @param rectOne First rectangle
 * @param rectTwo Second rectangle
 * @param strict If true, uses strict intersection (touching edges don't count)
 */
export function intersects(rectOne: Rectangle, rectTwo: Rectangle, strict: boolean = false): boolean {
  if (strict) {
    return (
      rectOne.x < rectTwo.x + rectTwo.width &&
      rectOne.x + rectOne.width > rectTwo.x &&
      rectOne.y < rectTwo.y + rectTwo.height &&
      rectOne.y + rectOne.height > rectTwo.y
    )
  } else {
    return (
      rectOne.x <= rectTwo.x + rectTwo.width &&
      rectOne.x + rectOne.width >= rectTwo.x &&
      rectOne.y <= rectTwo.y + rectTwo.height &&
      rectOne.y + rectOne.height >= rectTwo.y
    )
  }
}

/**
 * Convert a DOMRect to a Rectangle.
 */
export function rectToRectangle(rect: DOMRect): Rectangle {
  return {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  }
}
