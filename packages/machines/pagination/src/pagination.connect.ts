import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./pagination.anatomy"
import { dom } from "./pagination.dom"
import type { Send, State } from "./pagination.types"
import { utils } from "./pagination.utils"

type PageProps = {
  type: "page"
  value: number
}

type EllipsisProps = {
  index: number
}

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const totalPages = state.context.totalPages
  const page = state.context.page
  const translations = state.context.translations

  const previousPage = state.context.previousPage
  const nextPage = state.context.nextPage
  const pageRange = state.context.pageRange

  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  return {
    /**
     * The current page.
     */
    page,
    /**
     * The total number of pages.
     */
    totalPages,
    /**
     * The page range. Represented as an array of page numbers (including ellipsis)
     */
    pages: utils.getRange(state.context),
    /**
     * The previous page.
     */
    previousPage,
    /**
     * The next page.
     */
    nextPage,
    /**
     * The page range. Represented as an object with `start` and `end` properties.
     */
    pageRange,
    /**
     * Function to slice an array of data based on the current page.
     */
    slice<T>(data: T[]) {
      return data.slice(pageRange.start, pageRange.end)
    },
    /**
     * Whether the current page is the first page.
     */
    isFirstPage,
    /**
     * Whether the current page is the last page.
     */
    isLastPage,
    /**
     * Function to set the total number of pages.
     */
    setCount(count: number) {
      send({ type: "SET_COUNT", count })
    },
    /**
     * Function to set the page size.
     */
    setPageSize(size: number) {
      send({ type: "SET_PAGE_SIZE", size })
    },
    /**
     * Function to set the current page.
     */
    setPage(page: number) {
      send({ type: "SET_PAGE", page, srcElement: null })
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

    getPageTriggerProps(page: PageProps) {
      const index = page.value
      const isCurrentPage = index === state.context.page

      return normalize.element({
        id: dom.getPageTriggerId(state.context, index),
        ...parts.pageTrigger.attrs,
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : undefined,
        "aria-label": translations.pageTriggerLabel?.({ page: index, totalPages }),
        onClick(evt) {
          send({ type: "SET_PAGE", page: index, srcElement: evt.currentTarget })
        },
        ...(state.context.triggerType === "button" && { type: "button" }),
      })
    },

    prevPageTriggerProps: normalize.element({
      id: dom.getPrevPageTriggerId(state.context),
      ...parts.prevPageTrigger.attrs,
      "data-disabled": dataAttr(isFirstPage),
      onClick(evt) {
        send({ type: "PREVIOUS_PAGE", srcElement: evt.currentTarget })
      },
      ...(state.context.triggerType === "button" && { disabled: isFirstPage, type: "button" }),
    }),

    nextPageTriggerProps: normalize.element({
      id: dom.getNextPageTriggerId(state.context),
      ...parts.nextPageTrigger.attrs,
      "data-disabled": dataAttr(isLastPage),
      onClick(evt) {
        send({ type: "NEXT_PAGE", srcElement: evt.currentTarget })
      },
      ...(state.context.triggerType === "button" && { disabled: isLastPage, type: "button" }),
    }),
  }
}
