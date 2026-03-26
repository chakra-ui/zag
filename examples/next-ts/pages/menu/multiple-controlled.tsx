import styles from "../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

const MenuMultipleControlled = () => {
  const [open, setOpen] = useState(false)

  const service = useMachine(menu.machine, {
    id: useId(),
    onOpenChange: (details) => setOpen(details.open),
    open: open,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()} className={styles.Content}>
            <li {...api.getItemProps({ value: "edit" })} className={styles.Item}>Edit</li>
            <li {...api.getItemProps({ value: "duplicate" })} className={styles.Item}>Duplicate</li>
            <li {...api.getItemProps({ value: "delete" })} className={styles.Item}>Delete</li>
            <li {...api.getItemProps({ value: "export" })} className={styles.Item}>Export...</li>
          </div>
        </div>
      </Portal>
    </>
  )
}

export default function Page() {
  return (
    <main>
      <div style={{ display: "flex", gap: "16px" }}>
        <MenuMultipleControlled />
        <MenuMultipleControlled />
      </div>
    </main>
  )
}
