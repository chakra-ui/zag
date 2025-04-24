import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { useId } from "react"

export function Splitter(props: Omit<splitter.Props, "id" | "panels">) {
  const service = useMachine(splitter.machine, {
    id: useId(),
    panels: [{ id: "a" }, { id: "b" }],
    defaultSize: [50, 50],
    ...props,
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getPanelProps({ id: "a" })}>
        <p>A</p>
      </div>
      <div {...api.getResizeTriggerProps({ id: "a:b" })} />
      <div {...api.getPanelProps({ id: "b" })}>
        <p>B</p>
      </div>
    </div>
  )
}
