export function contains(
  parent: HTMLElement | EventTarget | null,
  child: HTMLElement | EventTarget | null,
) {
  if (!parent) return false
  return (
    parent === child ||
    (parent instanceof HTMLElement &&
      child instanceof HTMLElement &&
      parent.contains(child))
  )
}
