import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { useEffectOnce } from "../hooks/use-effect-once"

export default function Demo() {
  const service = useMachine(menu.machine, { id: useId() })
  const root = menu.connect(service, normalizeProps)

  const subService = useMachine(menu.machine, { id: useId() })
  const sub = menu.connect(subService, normalizeProps)

  useEffectOnce(() => {
    root.setChild(subService)
    sub.setParent(service)
  })

  const triggerItemProps = root.getTriggerItemProps(sub)

  return (
    <main>
      <div {...root.getContextTriggerProps()}>
        <div>Open context menu</div>
      </div>
      <Portal>
        <div {...root.getPositionerProps()}>
          <ul {...root.getContentProps()}>
            <li {...root.getItemProps({ value: "edit" })}>Edit</li>
            <li {...root.getItemProps({ value: "delete" })}>Delete</li>
            <li {...root.getItemProps({ value: "export" })}>Export</li>
            <li {...triggerItemProps}>
              <div>Appearance ➡️</div>
            </li>
            <li {...root.getItemProps({ value: "duplicate" })}>Duplicate</li>
          </ul>
        </div>
      </Portal>

      <Portal>
        <div {...sub.getPositionerProps()}>
          <ul {...sub.getContentProps()}>
            <li {...sub.getItemProps({ value: "full-screen" })}>Full screen</li>
            <li {...sub.getItemProps({ value: "zoom-in" })}>Zoom in</li>
            <li {...sub.getItemProps({ value: "zoom-out" })}>Zoom out</li>
          </ul>
        </div>
      </Portal>
    </main>
  )
}
