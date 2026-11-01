import { tabs, type SidebarDoc, type SidebarTab } from "sidebar.config"
import { isFramework } from "./framework-utils"

export function formatUrl(group: string, item: string, framework?: string) {
  const _framework = group === "components" ? framework : undefined
  return "/" + [group, _framework, item].filter(Boolean).join("/")
}

export function docHref(item: SidebarDoc, framework?: string) {
  return item.href ?? formatUrl(item.section, item.id, framework)
}

/** `/components/vue/dialog#api` -> `components/dialog` */
function pageKey(pathname: string) {
  const parts = pathname
    .replace(/[#?].*/, "")
    .split("/")
    .filter(Boolean)
  if (parts[0] === "components" && isFramework(parts[1])) parts.splice(1, 1)
  return parts.join("/")
}

const itemKey = (item: SidebarDoc) => `${item.section}/${item.id}`

export const tabItems = (tab: SidebarTab) =>
  tab.groups.flatMap((group) => group.items)

export function isCurrentDoc(item: SidebarDoc, pathname: string) {
  return !item.href && itemKey(item) === pageKey(pathname)
}

/** The tab that lists the current page, falling back to the URL section */
export function getActiveTab(pathname: string) {
  const owner = tabs.find((tab) =>
    tabItems(tab).some((item) => isCurrentDoc(item, pathname)),
  )
  const section = pageKey(pathname).split("/")[0]
  return owner ?? tabs.find((tab) => tab.id === section) ?? tabs[0]
}

type PaginationData = { framework: string; current: string }

/** Prev/next links stay inside the current tab */
export function paginate({ framework, current }: PaginationData) {
  const data = getActiveTab(current).groups.flatMap((group) =>
    group.items
      .filter((item) => !item.href)
      .map((item) => ({
        label: item.label,
        group: group.label,
        url: docHref(item, framework),
        current: isCurrentDoc(item, current),
      })),
  )
  const index = data.findIndex((item) => item.current)
  if (index === -1) return { prev: undefined, next: undefined }
  const prev = index > 0 ? data[index - 1] : undefined
  const next = index < data.length - 1 ? data[index + 1] : undefined
  return { prev, next }
}
