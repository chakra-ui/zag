import * as steps from "@zag-js/steps"
import { type AgentDescriptor, elementOf, itemsFrom } from "./shared"

const parts = steps.anatomy.build()

export const stepsAgent: AgentDescriptor<steps.Api> = {
  kind: "steps",
  machine: steps.machine,
  connect: steps.connect,
  element: (scope) => elementOf(scope, parts.list),
  state: (api) => ({ value: api.value, complete: api.complete }),
  items: (_api, scope) => itemsFrom(scope, parts.trigger),
  actions: {
    // A step the app hasn't made reachable yet stays where it is, which is reported as rejected.
    setValue: ({ api, args, item }) => {
      const value = item(args[0]).value
      api().setValue(value)
      return { key: "value", value }
    },
    next: ({ api }) => api().goToNextStep(),
    previous: ({ api }) => api().goToPreviousStep(),
  },
}
