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
        page: 1,
        messages: {
          rootLabel: "Pagination",
          itemLabel({ page, totalPages }) {
            const isLastPage = totalPages > 1 && page === totalPages
            return `${isLastPage ? "last page, " : ""}page ${page}`
          },
        },
        ...ctx,
      },

      watch: {
        page: ["invokeOnChange"],
        pageSize: ["setPageIfNeeded"],
      },

      computed: {
        totalPages: (ctx) => Math.ceil(ctx.count / ctx.pageSize),
        previousPage: (ctx) => (ctx.page === 1 ? null : ctx.page - 1),
        nextPage: (ctx) => (ctx.page === ctx.totalPages ? null : ctx.page + 1),
        pageRange: (ctx) => {
          const start = (ctx.page - 1) * ctx.pageSize
          const end = start + ctx.pageSize
          return { start, end }
        },
        paginationRange: (ctx) => utils.getPaginationRange(ctx),
      },

      on: {
        SET_COUNT: [
          {
            guard: "countIsOutOfRange",
            actions: ["setCount", "goToFirstPage"],
          },
          {
            actions: "setCount",
          },
        ],
        SET_PAGE: {
          guard: "isWithinBounds",
          actions: "setPage",
        },
        SET_PAGE_SIZE: { actions: "setPageSize" },
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
        isPageWithinBounds: (ctx) => ctx.page >= 1 && ctx.page <= ctx.totalPages,
        countIsOutOfRange: (ctx, evt) => ctx.page > evt.count,
        canGoToNextPage: (ctx) => {
          return ctx.page < ctx.totalPages
        },
        canGoToPrevPage: (ctx) => {
          return ctx.page > 1
        },
      },
      actions: {
        setCount(ctx, evt) {
          ctx.count = evt.count
        },
        setPage(ctx, evt) {
          ctx.page = evt.page
        },
        setPageSize(ctx, evt) {
          ctx.pageSize = evt.size
        },
        invokeOnChange(ctx, evt) {
          ctx.onChange?.({ page: ctx.page, srcElement: evt.srcElement || null })
        },
        goToFirstPage(ctx) {
          ctx.page = 1
        },
        goToPrevPage(ctx) {
          ctx.page = ctx.page - 1
        },
        goToNextPage(ctx) {
          ctx.page = ctx.page + 1
        },
        setPageIfNeeded(ctx) {
          if (ctx.page >= 1 && ctx.page <= ctx.totalPages) return
          ctx.page = 1
        },
      },
    },
  )
}
