function isScrollContainer(element: HTMLElement) {
  const styles = getComputedStyle(element)
  const overflow = styles.overflowY

  return overflow === "auto" || overflow === "scroll"
}

export function getScrollInfo(target: HTMLElement, container: HTMLElement) {
  let element = target
  let availableScroll = 0
  let availableScrollTop = 0

  while (element) {
    const { clientHeight, scrollTop, scrollHeight } = element

    const scrolled = scrollHeight - scrollTop - clientHeight

    if ((scrollTop !== 0 || scrolled !== 0) && isScrollContainer(element)) {
      availableScroll += scrolled
      availableScrollTop += scrollTop
    }

    if (element === container || element === document.documentElement) break
    element = element.parentNode as HTMLElement
  }

  return {
    availableScroll,
    availableScrollTop,
  }
}
