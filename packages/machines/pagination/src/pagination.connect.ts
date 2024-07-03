import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./pagination.anatomy"
import { dom } from "./pagination.dom"
import type { MachineApi, Send, State } from "./pagination.types"
import { getTransformedRange } from "./pagination.utils"

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
  const pages = getTransformedRange(state.context)

  return {
    page,
    pageSize: state.context.pageSize,
    totalPages,
    pages,
    previousPage,
    nextPage,
    pageRange,
    slice(data) {
      return data.slice(pageRange.start, pageRange.end)
    },
    setCount(count) {
      send({ type: "SET_COUNT", count })
    },
    setPageSize(size) {
      send({ type: "SET_PAGE_SIZE", size })
    },
    setPage(page) {
      send({ type: "SET_PAGE", page })
    },
    goToNextPage() {
      send({ type: "NEXT_PAGE" })
    },
    goToPrevPage() {
      send({ type: "PREVIOUS_PAGE" })
    },
    goToFirstPage() {
      send({ type: "FIRST_PAGE" })
    },
    goToLastPage() {
      send({ type: "LAST_PAGE" })
    },

    getRootProps() {
      return normalize.element({
        id: dom.getRootId(state.context),
        ...parts.root.attrs,
        dir: state.context.dir,
        "aria-label": translations.rootLabel,
      })
    },

    getEllipsisProps(props) {
      return normalize.element({
        id: dom.getEllipsisId(state.context, props.index),
        ...parts.ellipsis.attrs,
        dir: state.context.dir,
      })
    },

    getItemProps(props) {
      const index = props.value
      const isCurrentPage = index === state.context.page

      return normalize.element({
        id: dom.getItemId(state.context, index),
        ...parts.item.attrs,
        dir: state.context.dir,
        "data-index": index,
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : undefined,
        "aria-label": translations.itemLabel?.({ page: index, totalPages }),
        onClick() {
          send({ type: "SET_PAGE", page: index })
        },
        ...(isButton && { type: "button" }),
      })
    },

    getPrevTriggerProps() {
      return normalize.element({
        id: dom.getPrevTriggerId(state.context),
        ...parts.prevTrigger.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(isFirstPage),
        "aria-label": translations.prevTriggerLabel,
        onClick() {
          send({ type: "PREVIOUS_PAGE" })
        },
        ...(isButton && { disabled: isFirstPage, type: "button" }),
      })
    },

    getNextTriggerProps() {
      return normalize.element({
        id: dom.getNextTriggerId(state.context),
        ...parts.nextTrigger.attrs,
        dir: state.context.dir,
        "data-disabled": dataAttr(isLastPage),
        "aria-label": translations.nextTriggerLabel,
        onClick() {
          send({ type: "NEXT_PAGE" })
        },
        ...(isButton && { disabled: isLastPage, type: "button" }),
      })
    },
  }
}
