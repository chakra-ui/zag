import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./pagination.anatomy"
import { dom } from "./pagination.dom"
import type { EllipsisProps, PageTriggerProps, MachineApi, Send, State } from "./pagination.types"
import { utils } from "./pagination.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const totalPages = state.context.totalPages
  const page = state.context.page
  const translations = state.context.translations

  const previousPage = state.context.previousPage
  const nextPage = state.context.nextPage
  const pageRange = state.context.pageRange

  const type = state.context.type
  const isButton = type === "button"

  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return {
    page,
    totalPages,
    pages: utils.getRange(state.context),
    previousPage,
    nextPage,
    pageRange,
    isFirstPage,
    isLastPage,

    slice<T>(data: T[]) {
      return data.slice(pageRange.start, pageRange.end)
    },

    setCount(count: number) {
      send({ type: "SET_COUNT", count })
    },

    setPageSize(size: number) {
      send({ type: "SET_PAGE_SIZE", size })
    },

    setPage(page: number) {
      send({ type: "SET_PAGE", page })
    },

    rootProps: normalize.element({
      id: dom.getRootId(state.context),
      ...parts.root.attrs,
      "aria-label": translations.rootLabel,
    }),

    getEllipsisProps(props: EllipsisProps) {
      return normalize.element({
        id: dom.getEllipsisId(state.context, props.index),
        ...parts.ellipsis.attrs,
      })
    },

    getPageTriggerProps(page: PageTriggerProps) {
      const index = page.value
      const isCurrentPage = index === state.context.page

      return normalize.element({
        id: dom.getPageTriggerId(state.context, index),
        ...parts.pageTrigger.attrs,
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : undefined,
        "aria-label": translations.pageTriggerLabel?.({ page: index, totalPages }),
        onClick() {
          send({ type: "SET_PAGE", page: index })
        },
        ...(isButton && { type: "button" }),
      })
    },

    prevPageTriggerProps: normalize.element({
      id: dom.getPrevPageTriggerId(state.context),
      ...parts.prevPageTrigger.attrs,
      "data-disabled": dataAttr(isFirstPage),
      "aria-label": translations.prevPageTriggerLabel,
      onClick() {
        send({ type: "PREVIOUS_PAGE" })
      },
      ...(isButton && { disabled: isFirstPage, type: "button" }),
    }),

    nextPageTriggerProps: normalize.element({
      id: dom.getNextPageTriggerId(state.context),
      ...parts.nextPageTrigger.attrs,
      "data-disabled": dataAttr(isLastPage),
      "aria-label": translations.nextPageTriggerLabel,
      onClick() {
        send({ type: "NEXT_PAGE" })
      },
      ...(isButton && { disabled: isLastPage, type: "button" }),
    }),
  }
}
