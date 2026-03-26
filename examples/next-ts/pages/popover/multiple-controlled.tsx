import styles from "../../../../shared/src/css/popover.module.css"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

const PopoverControlled = () => {
  const [open, setOpen] = useState(false)

  const service = useMachine(popover.machine, {
    id: useId(),
    onOpenChange: (details) => setOpen(details.open),
    open: open,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api.getPositionerProps()} className={styles.Positioner}>
          <div {...api.getContentProps()} className={styles.Content}>
            <div {...api.getTitleProps()} className={styles.Title}>Presenters</div>
            <div {...api.getDescriptionProps()}>Description</div>
            <button onClick={() => setOpen(false)}>Action Button</button>
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
        <PopoverControlled />
        <PopoverControlled />
      </div>
    </main>
  )
}
