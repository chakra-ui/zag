import { dataAttr } from "@zag-js/dom-utils"
import { NormalizeProps, type PropTypes } from "@zag-js/types"
import { dom } from "./pagination.dom"
import { State, Send } from "./pagination.types"

type PageProps = {
  page: number
}
type DotProps = {
  index: number
}

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const pagesCount = state.context.totalPages
  const currentPage = state.context.currentPage
  const firstPageIndex = (currentPage - 1) * state.context.pageSize
  const lastPageIndex = firstPageIndex + state.context.pageSize

  return {
    currentPage,
    pagesCount,
    pages: state.context.paginationRange,
    dataRange: [firstPageIndex, lastPageIndex],
    updateItems(items: number) {
      send({ type: "UPDATE_ITEMS", items })
    },
    setPage(page: number) {
      send({ type: "SET_PAGE", page })
    },

    rootProps: normalize.element({
      id: dom.getRootId(state.context),
      "data-part": "root",
      "aria-label": "Pagination",
    }),

    getDotProps(props: DotProps) {
      return normalize.element({
        id: dom.getDotId(state.context, props.index),
        "data-part": "dot",
      })
    },

    getPageProps(props: PageProps) {
      const pageIndex = props.page
      const isActive = pageIndex === state.context.currentPage
      const isLastPage = pagesCount > 1 && pageIndex === pagesCount

      return normalize.element({
        id: dom.getPageId(state.context, pageIndex),
        "data-part": "page",
        "data-active": dataAttr(isActive),
        "aria-current": isActive ? "page" : undefined,
        "aria-label": `${isLastPage ? "last page, " : ""}page ${pageIndex}`,
        tabIndex: 0,
        onClick() {
          send({ type: "SET_PAGE", page: props.page })
        },
      })
    },

    prevButtonProps: normalize.element({
      id: dom.getPrevButtonId(state.context),
      "data-part": "prev-button",
      onClick() {
        send("PREVIOUS_PAGE")
      },
    }),
  }
}
