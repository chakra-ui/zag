import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type CollapsibleProps = {
  controls: {
    disabled: boolean
    dir: "ltr" | "rtl"
  }
}

export function Collapsible(props: CollapsibleProps) {
  const service = useMachine(collapsible.machine, {
    id: useId(),
    ...props.controls,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...api.getTriggerProps()}>Click to Toggle</button>
      <div {...api.getContentProps()}>
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna sfsd. Ut enim ad minimdfd
          v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
          ea commodo consequat. Excepteur sint occaecat cupidatat non proident,
          sunt in culpa qui officia deserunt mollit anim id est laborum.{" "}
          <a href="#">Some Link</a>
        </p>
      </div>
    </div>
  )
}
