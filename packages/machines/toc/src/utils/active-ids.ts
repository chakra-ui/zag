import type { TocItem } from "../toc.types"

export interface Heading {
  value: string
  el: HTMLElement
}

const getTop = (heading: Heading) => heading.el.getBoundingClientRect().top

export function getVisibleIds(items: TocItem[], visibilityMap: Map<string, boolean>) {
  return items.filter((item) => visibilityMap.get(item.value)).map((item) => item.value)
}

/** The last heading that has scrolled past the band's top */
export function findCurrentSection(headings: Heading[], bandTop: number) {
  for (let i = headings.length - 1; i >= 0; i--) {
    if (getTop(headings[i]) <= bandTop) return headings[i].value
  }
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
