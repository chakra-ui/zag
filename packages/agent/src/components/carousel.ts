import * as carousel from "@zag-js/carousel"
import { type AgentDescriptor, elementOf, toNumber } from "./shared"

const parts = carousel.anatomy.build()

// Pages count from 1, as a person reads them.
export const carouselAgent: AgentDescriptor<carousel.Api> = {
  kind: "carousel",
  machine: carousel.machine,
  connect: carousel.connect,
  element: (scope) => elementOf(scope, parts.root),
  state: (api) => ({ page: api.page + 1, pages: api.pageSnapPoints.length }),
  actions: {
    scrollTo: ({ api, args }) => {
      const page = toNumber(args[0])
      const pages = api().pageSnapPoints.length
      if (page < 1 || page > pages) throw new Error(`Pages go from 1 to ${pages}.`)
      api().scrollTo(page - 1, true)
      return { key: "page", value: page }
    },
    next: ({ api }) => api().scrollNext(true),
    previous: ({ api }) => api().scrollPrevious(true),
  },
}
