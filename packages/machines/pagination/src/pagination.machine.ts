import { createMachine, memo } from "@zag-js/core"
import type { PaginationSchema } from "./pagination.types"

export const machine = createMachine<PaginationSchema>({
  props({ props }) {
    return {
      defaultPageSize: 10,
      siblingCount: 1,
      boundaryCount: 1,
      defaultPage: 1,
      type: "button",
      count: 1,
      ...props,
      translations: {
        rootLabel: "pagination",
        firstTriggerLabel: "first page",
        prevTriggerLabel: "previous page",
        nextTriggerLabel: "next page",
        lastTriggerLabel: "last page",
        itemLabel({ page, totalPages }) {
          const isLastPage = totalPages > 1 && page === totalPages
          return `${isLastPage ? "last page, " : ""}page ${page}`
        },
        ...props.translations,
      },
    }
  },

  initialState() {
    return "idle"
  },

  context({ prop, bindable, getContext }) {
    return {
      page: bindable(() => ({
        value: prop("page"),
        defaultValue: prop("defaultPage"),
        onChange(value) {
          const context = getContext()
          prop("onPageChange")?.({ page: value, pageSize: context.get("pageSize") })
        },
      })),
      pageSize: bindable(() => ({
        value: prop("pageSize"),
        defaultValue: prop("defaultPageSize"),
        onChange(value) {
          prop("onPageSizeChange")?.({ pageSize: value })
        },
      })),
    }
  },

  watch({ track, context, action }) {
    track([() => context.get("pageSize")], () => {
      action(["setPageIfNeeded"])
    })
  },

  computed: {
    totalPages: memo(
      ({ prop, context }) => [context.get("pageSize"), prop("count")],
      ([pageSize, count]) => Math.ceil(count / pageSize),
    ),
    pageRange: memo(
      ({ context, prop }) => [context.get("page"), context.get("pageSize"), prop("count")],
      ([page, pageSize, count]) => {
        const start = (page - 1) * pageSize
        return { start, end: Math.min(start + pageSize, count) }
      },
    ),
    previousPage: ({ context }) => (context.get("page") === 1 ? null : context.get("page") - 1),
    nextPage: ({ context, computed }) =>
      context.get("page") === computed("totalPages") ? null : context.get("page") + 1,
    isValidPage: ({ context, computed }) => context.get("page") >= 1 && context.get("page") <= computed("totalPages"),
  },

  on: {
    SET_PAGE: {
      guard: "isValidPage",
      actions: ["setPage"],
    },
    SET_PAGE_SIZE: {
      actions: ["setPageSize"],
    },
    FIRST_PAGE: {
      actions: ["goToFirstPage"],
    },
    LAST_PAGE: {
      actions: ["goToLastPage"],
    },
    PREVIOUS_PAGE: {
      guard: "canGoToPrevPage",
      actions: ["goToPrevPage"],
    },
    NEXT_PAGE: {
      guard: "canGoToNextPage",
      actions: ["goToNextPage"],
    },
  },

  states: {
    idle: {},
  },

  implementations: {
    guards: {
      isValidPage: ({ event, computed }) => event.page >= 1 && event.page <= computed("totalPages"),
      isValidCount: ({ context, event }) => context.get("page") > event.count,
      canGoToNextPage: ({ context, computed }) => context.get("page") < computed("totalPages"),
      canGoToPrevPage: ({ context }) => context.get("page") > 1,
    },

    actions: {
      setPage({ context, event, computed }) {
        const page = clampPage(event.page, computed("totalPages"))
        context.set("page", page)
      },
      setPageSize({ context, event }) {
        context.set("pageSize", event.size)
      },
      goToFirstPage({ context }) {
        context.set("page", 1)
      },
      goToLastPage({ context, computed }) {
        context.set("page", computed("totalPages"))
      },
      goToPrevPage({ context, computed }) {
        context.set("page", (prev) => clampPage(prev - 1, computed("totalPages")))
      },
      goToNextPage({ context, computed }) {
        context.set("page", (prev) => clampPage(prev + 1, computed("totalPages")))
      },
      setPageIfNeeded({ context, computed }) {
        if (computed("isValidPage")) return
        context.set("page", 1)
      },
    },
  },
})

const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), totalPages)
