import { Fragment, useId, useState } from "react"
import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"

export default function Page() {
  const [open, setOpen] = useState(false)

  const initialContext = {
    id: useId(),
    open: false,
    "open.controlled": true,
  }

  const [state, send] = useMachine(popover.machine(initialContext), {
    context: {
      ...initialContext,
      onOpenChange: (details) => setOpen(details.open),
      open: open,
    },
  })

  const api = popover.connect(state, send, normalizeProps)

  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <main>
      <button {...api.getTriggerProps()}>Click me</button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getTitleProps()}>Presenters</div>
            <div {...api.getDescriptionProps()}>Description</div>
            <button onClick={() => setOpen(false)}>Action Button</button>
          </div>
        </div>
      </Wrapper>
    </main>
  )
}
