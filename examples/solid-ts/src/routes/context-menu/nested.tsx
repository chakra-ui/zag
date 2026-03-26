import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Portal } from "solid-js/web"
import { createMemo, createUniqueId, onMount } from "solid-js"

export default function Page() {
  const service = useMachine(menu.machine, { id: createUniqueId() })
  const root = createMemo(() => menu.connect(service, normalizeProps))

  const subService = useMachine(menu.machine, { id: createUniqueId() })
  const sub = createMemo(() => menu.connect(subService, normalizeProps))

  onMount(() => {
    root().setChild(subService)
    sub().setParent(service)
  })

  const triggerItemProps = createMemo(() => root().getTriggerItemProps(sub()))

  return (
    <main>
      <div {...root().getContextTriggerProps()}>
        <div>Open context menu</div>
      </div>
      <Portal>
        <div {...root().getPositionerProps()}>
          <ul {...root().getContentProps()}>
            <li {...root().getItemProps({ value: "edit" })}>Edit</li>
            <li {...root().getItemProps({ value: "delete" })}>Delete</li>
            <li {...root().getItemProps({ value: "export" })}>Export</li>
            <li {...triggerItemProps()}>
              <div>Appearance ➡️</div>
            </li>
            <li {...root().getItemProps({ value: "duplicate" })}>Duplicate</li>
          </ul>
        </div>
      </Portal>

      <Portal>
        <div {...sub().getPositionerProps()}>
          <ul {...sub().getContentProps()}>
            <li {...sub().getItemProps({ value: "full-screen" })}>Full screen</li>
            <li {...sub().getItemProps({ value: "zoom-in" })}>Zoom in</li>
            <li {...sub().getItemProps({ value: "zoom-out" })}>Zoom out</li>
          </ul>
        </div>
      </Portal>
    </main>
  )
}
