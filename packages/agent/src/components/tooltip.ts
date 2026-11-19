import * as tooltip from "@zag-js/tooltip"
import { textOf } from "../dom"
import { AGENT, type AgentDescriptor, elementOf, toBoolean, waitFor } from "./shared"

const parts = tooltip.anatomy.build()

// A tooltip's trigger is usually a button the page needs pressed, like an icon button, and being one of the
// tooltip's parts, it isn't listed as a plain button. So the tooltip lists it, named as the button is.
export const tooltipAgent: AgentDescriptor<tooltip.Api> = {
  kind: "tooltip",
  machine: tooltip.machine,
  connect: tooltip.connect,
  element: (scope) => elementOf(scope, parts.trigger),
  state: (api) => ({ open: api.open }),
  text: (scope) => [textOf(elementOf(scope, parts.content))].filter(Boolean),
  actions: {
    // Presses the trigger, like clicking the button the tooltip describes.
    async press({ scope, press }) {
      const trigger = elementOf(scope, parts.trigger)
      if (!trigger) throw new Error("The tooltip's trigger isn't on the page.")
      await press(trigger)
    },
    // Opens after its delay, as on hover, so this waits for it.
    async setOpen({ api, args }) {
      const value = toBoolean(args[0])
      api().setOpen(value, AGENT)
      await waitFor(() => api().open === value)
      return { key: "open", value }
    },
  },
}
