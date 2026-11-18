import * as tour from "@zag-js/tour"
import { textOf } from "../dom"
import { type AgentDescriptor, elementOf, pressIn } from "./shared"

const parts = tour.anatomy.build()

export const tourAgent: AgentDescriptor<tour.Api> = {
  kind: "tour",
  machine: tour.machine,
  connect: tour.connect,
  element: (scope) => elementOf(scope, parts.content),
  name: (scope) => textOf(elementOf(scope, parts.title)) || undefined,
  state: (api) => ({ open: api.open, step: api.stepIndex + 1, steps: api.totalSteps }),
  text: (scope) => [textOf(elementOf(scope, parts.title)), textOf(elementOf(scope, parts.description))].filter(Boolean),
  container: (scope) => elementOf(scope, parts.content),
  actions: {
    next: ({ api }) => api().next(),
    previous: ({ api }) => api().previous(),
    // Presses one of its buttons, like "Skip" or its close button.
    press: ({ args, scope, press }) => pressIn(elementOf(scope, parts.content), args[0], press),
  },
}
