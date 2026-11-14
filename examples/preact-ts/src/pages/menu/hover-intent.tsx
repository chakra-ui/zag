import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/menu.css"

export default function Page() {
  const service = useMachine(menu.machine, { id: useId(), onSelect: console.log })
  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <main>
        <label>
          Search <input placeholder="Keep typing while the menu opens" />
        </label>
        <div
          onPointerEnter={() => api.setOpen(true, "trigger-hover")}
          onPointerLeave={() => api.setOpen(false, "trigger-hover")}
        >
          <button {...api.getTriggerProps()}>
            Actions <span {...api.getIndicatorProps()}>▾</span>
          </button>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()}>
              <li {...api.getItemProps({ value: "edit" })}>Edit</li>
              <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
              <li {...api.getItemProps({ value: "delete" })}>Delete</li>
            </ul>
          </div>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
