import { createMachine } from "@zag-js/core"
import type { IntlTranslations, PaginationSchema } from "./pagination.types"

const defaultTranslations: IntlTranslations = {
  rootLabel: "pagination",
  prevTriggerLabel: "previous page",
  nextTriggerLabel: "next page",
  itemLabel({ page, totalPages }) {
    const isLastPage = totalPages > 1 && page === totalPages
    return `${isLastPage ? "last page, " : ""}page ${page}`
  },
}

export const machine = createMachine<PaginationSchema>({
  props({ props }) {
    return {
      defaultPageSize: 10,
      siblingCount: 1,
      defaultPage: 1,
      type: "button",
      count: 1,
      translations: defaultTranslations,
      ...props,
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
    track([() => context.get("page")], () => {
      action(["setPageIfNeeded"])
    })
  },

  computed: {
    totalPages: ({ context, prop }) => Math.ceil(prop("count") / context.get("pageSize")),
    previousPage: ({ context }) => (context.get("page") === 1 ? null : context.get("page") - 1),
    nextPage: ({ context, computed }) =>
      context.get("page") === computed("totalPages") ? null : context.get("page") + 1,
    pageRange: ({ context, prop }) => {
      const start = (context.get("page") - 1) * context.get("pageSize")
      const end = Math.min(start + context.get("pageSize"), prop("count"))
      return { start, end }
    },
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
        context.set("page", (prev) => {
          return clampPage(prev - 1, computed("totalPages"))
        })
      },
      goToNextPage({ context, computed }) {
        context.set("page", (prev) => {
          return clampPage(prev + 1, computed("totalPages"))
        })
      },
      setPageIfNeeded({ context, computed }) {
        if (computed("isValidPage")) return
        context.set("page", 1)
      },
    },
  },
})

const clampPage = (page: number, totalPages: number) => Math.min(Math.max(page, 1), totalPages)
