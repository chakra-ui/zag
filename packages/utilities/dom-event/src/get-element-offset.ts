export function getElementOffset(element: HTMLElement) {
  let left = 0
  let top = 0
  let el = element
  const win = element.ownerDocument.defaultView || window

  if (el.parentNode) {
    do {
      left += el.offsetLeft
      top += el.offsetTop
    } while ((el = el.offsetParent as HTMLElement) && el.nodeType < 9)

    el = element

    do {
      left -= el.scrollLeft
      top -= el.scrollTop
    } while ((el = el.parentNode as HTMLElement) && !/body/i.test(el.nodeName))
  }

  return {
    top: top,
    right: win.innerWidth - left - element.offsetWidth,
    bottom: win.innerHeight - top - element.offsetHeight,
    left: left,
  }
}
