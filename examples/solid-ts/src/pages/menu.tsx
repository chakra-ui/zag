import { injectGlobal } from "@emotion/css"
import * as menu from "@zag-js/menu"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { menuStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default function Page() {
  const [state, send] = useMachine(menu.machine)

  const ref = useSetup<HTMLButtonElement>({ send, id: createUniqueId() })

  const api = createMemo(() => menu.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <button ref={ref} {...api().triggerProps}>
          Actions <span aria-hidden>▾</span>
        </button>
        <div {...api().positionerProps}>
          <ul {...api().contentProps}>
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
