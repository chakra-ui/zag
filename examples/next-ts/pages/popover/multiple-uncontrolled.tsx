import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"

const PopoverUncontrolled = () => {
  const service = useMachine(popover.machine, { id: useId() })
  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getTitleProps()}>Presenters</div>
            <div {...api.getDescriptionProps()}>Description</div>
            <button onClick={() => api.setOpen(false)}>Action Button</button>
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
        <PopoverUncontrolled />
        <PopoverUncontrolled />
      </div>
    </main>
  )
}
