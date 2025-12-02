import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./pagination.anatomy"
import * as dom from "./pagination.dom"
import type { PaginationService, PaginationApi } from "./pagination.types"
import { getTransformedRange } from "./pagination.utils"

export function connect<T extends PropTypes>(
  service: PaginationService,
  normalize: NormalizeProps<T>,
): PaginationApi<T> {
  const { send, scope, prop, computed, context } = service

  const totalPages = computed("totalPages")
  const page = context.get("page")
  const pageSize = context.get("pageSize")
  const translations = prop("translations")

  const count = prop("count")
  const getPageUrl = prop("getPageUrl")
  const type = prop("type")

  const previousPage = computed("previousPage")
  const nextPage = computed("nextPage")
  const pageRange = computed("pageRange")

  const isFirstPage = page === 1
  const isLastPage = page === totalPages

  const pages = getTransformedRange({
    page,
    totalPages,
    siblingCount: prop("siblingCount"),
    boundaryCount: prop("boundaryCount"),
  })

  return {
    count,
    page,
    pageSize,
    totalPages,
    pages,
    previousPage,
    nextPage,
    pageRange,
    slice(data) {
      return data.slice(pageRange.start, pageRange.end)
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
        id: dom.getRootId(scope),
        ...parts.root.attrs,
        dir: prop("dir"),
        "aria-label": translations.rootLabel,
      })
    },

    getEllipsisProps(props) {
      return normalize.element({
        id: dom.getEllipsisId(scope, props.index),
        ...parts.ellipsis.attrs,
        dir: prop("dir"),
      })
    },

    getItemProps(props) {
      const index = props.value
      const isCurrentPage = index === page

      return normalize.element({
        id: dom.getItemId(scope, index),
        ...parts.item.attrs,
        dir: prop("dir"),
        "data-index": index,
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : undefined,
        "aria-label": translations.itemLabel?.({ page: index, totalPages }),
        onClick() {
          send({ type: "SET_PAGE", page: index })
        },
        ...(type === "button" && { type: "button" }),
        ...(type === "link" &&
          getPageUrl && {
            href: getPageUrl({ page: index, pageSize }),
          }),
      })
    },

    getPrevTriggerProps() {
      return normalize.element({
        id: dom.getPrevTriggerId(scope),
        ...parts.prevTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isFirstPage),
        "aria-label": translations.prevTriggerLabel,
        onClick() {
          send({ type: "PREVIOUS_PAGE" })
        },
        ...(type === "button" && { disabled: isFirstPage, type: "button" }),
        ...(type === "link" &&
          getPageUrl &&
          previousPage && {
            href: getPageUrl({ page: previousPage, pageSize }),
          }),
      })
    },

    getFirstTriggerProps() {
      return normalize.element({
        id: dom.getFirstTriggerId(scope),
        ...parts.firstTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isFirstPage),
        "aria-label": translations.firstTriggerLabel,
        onClick() {
          send({ type: "FIRST_PAGE" })
        },
        ...(type === "button" && { disabled: isFirstPage, type: "button" }),
        ...(type === "link" &&
          getPageUrl && {
            href: getPageUrl({ page: 1, pageSize }),
          }),
      })
    },

    getNextTriggerProps() {
      return normalize.element({
        id: dom.getNextTriggerId(scope),
        ...parts.nextTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isLastPage),
        "aria-label": translations.nextTriggerLabel,
        onClick() {
          send({ type: "NEXT_PAGE" })
        },
        ...(type === "button" && { disabled: isLastPage, type: "button" }),
        ...(type === "link" &&
          getPageUrl &&
          nextPage && {
            href: getPageUrl({ page: nextPage, pageSize }),
          }),
      })
    },

    getLastTriggerProps() {
      return normalize.element({
        id: dom.getLastTriggerId(scope),
        ...parts.lastTrigger.attrs,
        dir: prop("dir"),
        "data-disabled": dataAttr(isLastPage),
        "aria-label": translations.lastTriggerLabel,
        onClick() {
          send({ type: "LAST_PAGE" })
        },
        ...(type === "button" && { disabled: isLastPage, type: "button" }),
        ...(type === "link" &&
          getPageUrl && {
            href: getPageUrl({ page: totalPages, pageSize }),
          }),
      })
    },
  }
}
