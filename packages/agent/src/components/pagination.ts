import * as pagination from "@zag-js/pagination"
import { type AgentDescriptor, elementOf, toNumber } from "./shared"

const parts = pagination.anatomy.build()

export const paginationAgent: AgentDescriptor<pagination.Api> = {
  kind: "pagination",
  machine: pagination.machine,
  connect: pagination.connect,
  element: (scope) => elementOf(scope, parts.root),
  state: (api) => ({ page: api.page, pages: api.totalPages }),
  value: "page",
  actions: {
    setPage: ({ api, args }) => {
      const value = toNumber(args[0])
      if (value < 1 || value > api().totalPages) throw new Error(`Pages go from 1 to ${api().totalPages}.`)
      api().setPage(value)
      return { key: "page", value }
    },
    next: ({ api }) => api().goToNextPage(),
    previous: ({ api }) => api().goToPreviousPage(),
  },
}
