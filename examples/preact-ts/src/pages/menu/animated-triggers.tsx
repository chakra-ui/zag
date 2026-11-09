import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { Presence } from "../../components/presence"
import "@styles/menu-viewport.css"

const menus = [
  { value: "file", label: "File", items: ["New file", "Open…", "Save", "Save as…"] },
  { value: "edit", label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
  { value: "view", label: "View", items: ["Zoom in", "Zoom out", "Toggle full screen mode"] },
]

export default function Page() {
  const service = useMachine(menu.machine, {
    id: useId(),
    positioning: { placement: "bottom-start" },
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <main className="menu animated-triggers">
      <div className="animated-triggers__list">
        {menus.map((item) => (
          <button key={item.value} {...api.getTriggerProps({ value: item.value })}>
            {item.label}
          </button>
        ))}
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getArrowProps()}>
            <div {...api.getArrowTipProps()} />
          </Presence>
          <Presence {...api.getViewportProps()}>
            {menus.map((item) => (
              <Presence key={item.value} {...api.getContentProps({ value: item.value })}>
                {item.items.map((label) => (
                  <div key={label} {...api.getItemProps({ value: `${item.value}:${label}` })}>
                    {label}
                  </div>
                ))}
              </Presence>
            ))}
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
