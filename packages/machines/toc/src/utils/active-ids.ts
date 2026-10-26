export interface Heading {
  value: string
  el: HTMLElement
}

const getTop = (heading: Heading) => heading.el.getBoundingClientRect().top

export function getVisibleIds(headings: Heading[], visibilityMap: Map<string, boolean>) {
  return headings.filter((heading) => visibilityMap.get(heading.value)).map((heading) => heading.value)
}

/** The last heading that has scrolled past the band's top. Headings are in document order, so binary search */
export function findCurrentSection(headings: Heading[], bandTop: number) {
  let low = 0
  let high = headings.length - 1
  let value: string | undefined
  while (low <= high) {
    const mid = (low + high) >> 1
    if (getTop(headings[mid]) <= bandTop) {
      value = headings[mid].value
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return value
}

/** Near the end, slides an activation line down to the last heading so each one takes a turn */
export function findEndOfPageHeading(headings: Heading[], container: HTMLElement, bandTop: number) {
  const lastHeading = headings[headings.length - 1]
  if (!lastHeading) return

  const maxScroll = container.scrollHeight - container.clientHeight
  const remaining = maxScroll - container.scrollTop

  const overflow = getTop(lastHeading) - bandTop - remaining
  if (overflow <= 0) return

  const stretch = Math.min(overflow, maxScroll)
  if (remaining >= stretch) return

  const line = bandTop + overflow * (1 - remaining / stretch)
  return headings.find((heading) => getTop(heading) >= line - 1)?.value
}
