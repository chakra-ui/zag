import type { TocItem } from "../toc.types"

export interface Heading {
  value: string
  el: HTMLElement
}

const getTop = (heading: Heading) => heading.el.getBoundingClientRect().top

/**
 * The ids of the headings in the observed band, in document order.
 */
export function getVisibleIds(items: TocItem[], visibilityMap: Map<string, boolean>) {
  return items.filter((item) => visibilityMap.get(item.value)).map((item) => item.value)
}

/**
 * The section the reader is in when no heading is visible: the last heading
 * that has scrolled past the band's top edge.
 */
export function findCurrentSection(headings: Heading[], bandTop: number) {
  for (let i = headings.length - 1; i >= 0; i--) {
    if (getTop(headings[i]) <= bandTop) return headings[i].value
  }
}

/**
 * The last headings may never reach the top of the view. Over the final stretch
 * of scrolling, an activation line slides from the band's top down to the last
 * heading, so each of them becomes active in turn.
 */
export function findEndOfPageHeading(headings: Heading[], container: HTMLElement, bandTop: number) {
  const lastHeading = headings[headings.length - 1]
  if (!lastHeading) return

  const maxScroll = container.scrollHeight - container.clientHeight
  const remaining = maxScroll - container.scrollTop

  // How far below the band's top the last heading sits once fully scrolled
  const overflow = getTop(lastHeading) - bandTop - remaining
  if (overflow <= 0) return

  const stretch = Math.min(overflow, maxScroll)
  if (remaining >= stretch) return

  const line = bandTop + overflow * (1 - remaining / stretch)
  return headings.find((heading) => getTop(heading) >= line - 1)?.value
}
