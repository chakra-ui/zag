export function getOwner(el: HTMLElement) {
  return {
    doc: el?.ownerDocument ?? document,
    win: el?.ownerDocument.defaultView ?? window,
    root: el?.getRootNode(),
  }
}

export function getParent(el: HTMLElement): HTMLElement {
  const { doc } = getOwner(el)
  if (el.localName === "html") return el
  return el.assignedSlot || el.parentElement || doc.documentElement
}
