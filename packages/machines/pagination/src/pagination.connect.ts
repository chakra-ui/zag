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
    page,
    totalPages,
    pages: utils.getRange(state.context),
    previousPage,
    nextPage,
    pageRange,
    slice<T>(data: T[]) {
      return data.slice(pageRange.start, pageRange.end)
    },
    isFirstPage,
    isLastPage,

    setCount(count: number) {
      send({ type: "SET_COUNT", count })
    },
    setPageSize(size: number) {
      send({ type: "SET_PAGE_SIZE", size })
    },

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
      })
    },

    prevPageTriggerProps: normalize.element({
      id: dom.getPrevPageTriggerId(state.context),
      ...parts.prevPageTrigger.attrs,
      "data-disabled": dataAttr(isFirstPage),
      onClick(evt) {
        send({ type: "PREVIOUS_PAGE", srcElement: evt.currentTarget })
      },
    }),

    nextPageTriggerProps: normalize.element({
      id: dom.getNextPageTriggerId(state.context),
      ...parts.nextPageTrigger.attrs,
      "data-disabled": dataAttr(isLastPage),
      onClick(evt) {
        send({ type: "NEXT_PAGE", srcElement: evt.currentTarget })
      },
    }),
  }
}
