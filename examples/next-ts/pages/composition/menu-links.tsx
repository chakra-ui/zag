import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const [state, send] = useMachine(menu.machine({ id: useId() }))
  const api = menu.connect(state, send, normalizeProps)

  return (
    <div style={{ padding: "20px" }}>
      <p>Use a screen reader to navigate to the menu.</p>
      <button {...api.getTriggerProps()}>
        Actions <span {...api.getIndicatorProps()}>▾</span>
      </button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getItemProps({ value: "edit" })}>Edit</div>
          <div {...api.getItemProps({ value: "duplicate" })}>Duplicate</div>
          <a {...api.getItemProps({ value: "delete" })} href="https://github.com">
            Delete
          </a>
          <div {...api.getItemProps({ value: "export" })}>Export...</div>
        </div>
      </div>
    </div>
  )
}
