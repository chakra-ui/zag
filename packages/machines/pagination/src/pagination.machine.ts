import { createMachine } from "@zag-js/core"
import { MachineContext, MachineState, UserDefinedContext } from "./pagination.types"
import { utils } from "./pagination.utils"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "pagination",
      initial: "unknown",
      context: {
        pageSize: 10,
        siblingCount: 1,
        currentPage: 0,
        ...ctx,
      },

      watch: {
        currentPage: ["invokeOnChange"],
      },

      computed: {
        totalPages: (ctx) => Math.ceil(ctx.itemsCount / ctx.pageSize),
        firstPageIndex: (ctx) => (ctx.currentPage - 1) * ctx.pageSize,
        lastPageIndex: (ctx) => ctx.firstPageIndex + ctx.pageSize,
        paginationRange: (ctx) => {
          const totalPageNumbers = ctx.siblingCount + 5
          if (totalPageNumbers >= ctx.totalPages) return utils.transform(utils.range(1, ctx.totalPages))

          const DOT = "dot"

          const leftSiblingIndex = Math.max(ctx.currentPage - ctx.siblingCount, 1)
          const rightSiblingIndex = Math.min(ctx.currentPage + ctx.siblingCount, ctx.totalPages)

          const shouldShowLeftDots = leftSiblingIndex > 2
          const shouldShowRightDots = rightSiblingIndex < ctx.totalPages - 2

          const firstPageIndex = 1
          const lastPageIndex = ctx.totalPages

          if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftItemCount = 3 + 2 * ctx.siblingCount
            let leftRange = utils.range(1, leftItemCount)

            return utils.transform([...leftRange, DOT, ctx.totalPages])
          }

          if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightItemCount = 3 + 2 * ctx.siblingCount
            let rightRange = utils.range(ctx.totalPages - rightItemCount + 1, ctx.totalPages)
            return utils.transform([firstPageIndex, DOT, ...rightRange])
          }

          if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = utils.range(leftSiblingIndex, rightSiblingIndex)
            return utils.transform([firstPageIndex, DOT, ...middleRange, DOT, lastPageIndex])
          }
          return []
        },
      },

      on: {
        UPDATE_ITEMS: [
          {
            guard: "currentPageIsAboveNewItemsCount",
            actions: ["updateItems", "goToFirstPage"],
          },
          {
            actions: "updateItems",
          },
        ],
        SET_PAGE: {
          actions: "setPage",
          guard: "isWithinBounds",
        },
        SET_PAGE_SIZE: {
          actions: "setPageSize",
        },
        PREVIOUS_PAGE: {
          guard: "canGoToPrevPage",
          actions: "goToPrevPage",
        },
        NEXT_PAGE: {
          guard: "canGoToNextPage",
          actions: "goToNextPage",
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: "idle",
          },
        },
      },
    },
    {
      guards: {
        isWithinBounds: (ctx, evt) => evt.page >= 1 && evt.page <= ctx.totalPages,
        currentPageIsAboveNewItemsCount: (ctx, evt) => ctx.currentPage > evt.items,
        canGoToNextPage: (ctx) => {
          return ctx.currentPage < ctx.totalPages
        },
        canGoToPrevPage: (ctx) => {
          return ctx.currentPage > 1
        },
      },
      actions: {
        updateItems(ctx, evt) {
          ctx.itemsCount = evt.items
        },
        setPage(ctx, evt) {
          ctx.currentPage = evt.page
        },
        setPageSize(ctx, evt) {
          ctx.pageSize = evt.size
        },
        invokeOnChange(ctx) {
          ctx.onChange?.(ctx.currentPage)
        },
        goToFirstPage(ctx) {
          ctx.currentPage = 1
        },
        goToPrevPage(ctx) {
          ctx.currentPage = ctx.currentPage - 1
        },
        goToNextPage(ctx) {
          ctx.currentPage = ctx.currentPage + 1
        },
      },
    },
  )
}
