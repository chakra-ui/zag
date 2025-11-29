import { highlightState } from "@zag-js/stringify-state"
import Alpine from "alpinejs"

Alpine.magic("highlightState", (el) => {
  return ({ label, omit, context }: { label: string; omit?: string[]; context?: string[] }) => {
    const { [`_x_${label.replaceAll("-", "_")}_service`]: service } = Alpine.$data(el) as any
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
