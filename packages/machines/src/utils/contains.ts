import { isElement } from "./guard"

type Node = HTMLElement | EventTarget | null

export const contains = (parent: Node | undefined, child: Node) => {
  if (!parent) return false
  return parent === child || (isElement(parent) && isElement(child) && parent.contains(child))
}
