import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const [nextContent, setNextContent] = createSignal(false)
  const service = useMachine(dialog.machine, { id: "1" })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}> Click me</button>
      <Portal>
        <div {...api().getBackdropProps()} />
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <Show when={!nextContent()}>
              <button onClick={() => setNextContent(true)}>Set next content</button>
            </Show>
            <Show when={nextContent()}>
              <button onClick={() => setNextContent(false)}>Set previous content</button>
            </Show>
          </div>
        </div>
      </Portal>
    </main>
  )
}
