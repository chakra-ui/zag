import { injectGlobal } from "@emotion/css"
import * as menu from "@ui-machines/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(
    menu.machine.withContext({
      contextMenu: true,
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLUListElement>({ send, id: "1" })

  const api = createMemo(() => menu.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <div {...api().contextTriggerProps}>
          <div style={{ border: "solid 1px red" }}>Open context menu</div>
        </div>
        <div {...api().positionerProps}>
          <ul ref={ref} {...api().contentProps}>
            <li {...api().getItemProps({ id: "edit" })}>Edit</li>
            <li {...api().getItemProps({ id: "duplicate" })}>Duplicate</li>
            <li {...api().getItemProps({ id: "delete" })}>Delete</li>
            <li {...api().getItemProps({ id: "export" })}>Export...</li>
          </ul>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
