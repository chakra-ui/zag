import { dataAttr } from "@zag-js/dom-utils"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { dom } from "./pagination.dom"
import { Send, State } from "./pagination.types"
import { utils } from "./pagination.utils"

type PageProps = {
  type: "page"
  value: number
}

type EllipsisProps = {
  index: string | number
}

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const totalPages = state.context.totalPages
  const page = state.context.page
  const messages = state.context.messages

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
      "data-part": "root",
      "aria-label": messages.rootLabel,
    }),

    getEllipsisProps(props: EllipsisProps) {
      return normalize.element({
        id: dom.getEllipsisId(state.context, props.index),
        "data-part": "ellipsis",
      })
    },

    getItemProps(page: PageProps) {
      const pageIndex = page.value
      const isCurrentPage = pageIndex === state.context.page

      return normalize.element({
        id: dom.getItemId(state.context, pageIndex),
        "data-part": "item",
        "data-selected": dataAttr(isCurrentPage),
        "aria-current": isCurrentPage ? "page" : undefined,
        "aria-label": messages.itemLabel?.({ page: pageIndex, totalPages }),
        onClick(evt) {
          send({ type: "SET_PAGE", page: pageIndex, srcElement: evt.currentTarget })
        },
      })
    },

    prevItemProps: normalize.element({
      id: dom.getPrevItemId(state.context),
      "data-part": "prev-item",
      "data-disabled": dataAttr(isFirstPage),
      onClick(evt) {
        send({ type: "PREVIOUS_PAGE", srcElement: evt.currentTarget })
      },
    }),

    nextItemProps: normalize.element({
      id: dom.getNextItemId(state.context),
      "data-part": "next-item",
      "data-disabled": dataAttr(isLastPage),
      onClick(evt) {
        send({ type: "NEXT_PAGE", srcElement: evt.currentTarget })
      },
    }),
  }
}
