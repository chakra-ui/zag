import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/preact"
import { useRef } from "preact/hooks"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)
  const service = useMachine(dialog.machine, {
    id: "1",
    initialFocusEl: () => inputRef.current,
  })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}>Open dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <button {...api.getCloseTriggerProps()}>Close</button>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>The name input receives focus via initialFocusEl.</p>
              <input ref={inputRef} placeholder="Enter name..." />
              <button>Save</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
