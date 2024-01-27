export function isHiddenElement(node: HTMLElement) {
  if (node.parentElement && isHiddenElement(node.parentElement)) return true
  return node.hidden
}
