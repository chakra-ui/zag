import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"

export default function Page() {
  const service = useMachine(menu.machine, { id: useId() })
  const api = menu.connect(service, normalizeProps)

  return (
    <div style={{ padding: "20px" }}>
      <p>Use a screen reader to navigate to the menu.</p>
      <button {...api.getTriggerProps()}>
        Actions <span {...api.getIndicatorProps()}>▾</span>
      </button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <a {...api.getItemProps({ value: "edit" })} href="https://google.com">
            Google
          </a>
          <a {...api.getItemProps({ value: "duplicate" })} href="https://bing.com">
            Bing
          </a>
          <a {...api.getItemProps({ value: "delete" })} href="https://github.com" target="_blank">
            GitHub
          </a>
          <a {...api.getItemProps({ value: "export" })} href="https://youtube.com" target="_blank">
            YouTube
          </a>
        </div>
      </div>
    </div>
  )
}
