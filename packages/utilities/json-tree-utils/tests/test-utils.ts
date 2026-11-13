import type { JsonNodeHastElement } from "../src"

export const elementText = (element: JsonNodeHastElement): string =>
  element.type === "text" ? String(element.value) : element.children.map(elementText).join("")
