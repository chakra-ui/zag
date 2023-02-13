import React, { useRef } from "react"
import * as menu from "@zag-js/menu"
import { useMachine, normalizeProps } from "@zag-js/react"

export const Menu: React.FC<{ id: string }> = ({ id }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [state, send] = useMachine(
    menu.machine({
      id,
      "aria-label": "File",
      getRootNode() {
        return ref.current?.getRootNode({ composed: false }) ?? document
      },
    }),
  )
  const api = menu.connect(state, send, normalizeProps)

  return (
    <div ref={ref}>
      <button {...api.triggerProps}>
        Actions <span aria-hidden>▾</span>
      </button>
      <div {...api.positionerProps}>
        <ul {...api.contentProps} style={{ backgroundColor: "white", color: "black" }}>
          <li {...api.getItemProps({ id: "edit" })}>Edit</li>
          <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
          <li {...api.getItemProps({ id: "delete" })}>Delete</li>
          <li {...api.getItemProps({ id: "export" })}>Export...</li>
        </ul>
      </div>
    </div>
  )
}
