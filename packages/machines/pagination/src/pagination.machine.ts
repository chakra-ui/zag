import { createMachine } from "@zag-js/core"
import { compact, isEqual } from "@zag-js/utils"
import type { MachineContext, MachineState, UserDefinedContext } from "./pagination.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "pagination",
      initial: "idle",
      context: {
        pageSize: 10,
        siblingCount: 1,
        page: 1,
        type: "button",
        translations: {
          rootLabel: "pagination",
          prevPageTriggerLabel: "previous page",
          nextPageTriggerLabel: "next page",
          pageTriggerLabel({ page, totalPages }) {
            const isLastPage = totalPages > 1 && page === totalPages
            return `${isLastPage ? "last page, " : ""}page ${page}`
          },
          ...ctx.translations,
        },
        ...ctx,
      },

      watch: {
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
        isValidPage: (ctx) => ctx.page >= 1 && ctx.page <= ctx.totalPages,
      },

      on: {
        SET_COUNT: [
          {
            guard: "isValidCount",
            actions: ["setCount", "goToFirstPage"],
          },
          {
            actions: "setCount",
          },
        ],
        SET_PAGE: {
          guard: "isValidPage",
          actions: "setPage",
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
        idle: {},
      },
    },
    {
      guards: {
        isValidPage: (ctx, evt) => evt.page >= 1 && evt.page <= ctx.totalPages,
        isValidCount: (ctx, evt) => ctx.page > evt.count,
        canGoToNextPage: (ctx) => ctx.page < ctx.totalPages,
        canGoToPrevPage: (ctx) => ctx.page > 1,
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
        goToFirstPage(ctx) {
          set.page(ctx, 1)
        },
        goToPrevPage(ctx) {
          set.page(ctx, ctx.page - 1)
        },
        goToNextPage(ctx) {
          set.page(ctx, ctx.page + 1)
        },
        setPageIfNeeded(ctx, _evt) {
          if (ctx.isValidPage) return
          set.page(ctx, 1)
        },
      },
    },
  )
}

const set = {
  page: (ctx: MachineContext, value: number) => {
    if (isEqual(ctx.page, value)) return
    ctx.page = value
    ctx.onChange?.({ page: ctx.page, pageSize: ctx.pageSize })
  },
}
