import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useState } from "react"

export default function Dialog() {
  const [nextContent, setNextContent] = useState(false)
  const service = useMachine(dialog.machine, { id: "1" })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}> Click me</button>
      <Portal>
        <div {...api.getBackdropProps()} />
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            {!nextContent && <button onClick={() => setNextContent(true)}>Set next content</button>}
            {nextContent && <button onClick={() => setNextContent(false)}>Set previous content</button>}
          </div>
        </div>
      </Portal>
    </main>
  )
}
