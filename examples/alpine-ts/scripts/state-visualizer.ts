import { highlightState } from "@zag-js/stringify-state"
import Alpine from "alpinejs"
import type { StateVisualizerProps } from "../server/components/state-visualizer"

Alpine.magic("highlightState", (el) => {
  return ({ label, modifier, omit, context }: StateVisualizerProps) => {
    const { service } = (Alpine.$data(el) as any)[
      "$" +
        label
          .split("-")
          .map((str, i) => (i === 0 ? str : str.at(0)?.toUpperCase() + str.substring(1).toLowerCase()))
          .join("")
    ](modifier)
    return highlightState(
      {
        state: service.state.get(),
        event: service.event.current(),
        previouseEvent: service.event.previous(),
        context: context ? Object.fromEntries(context.map((key) => [key, service.context.get(key)])) : undefined,
      },
      omit,
    )
  }
})
