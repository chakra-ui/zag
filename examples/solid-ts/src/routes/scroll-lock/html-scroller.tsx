import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, onCleanup, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/dialog.css"

export default function Page() {
  const service = useMachine(dialog.machine, { id: "1" })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  // Make <html> its own scroll container, like an app shell that scrolls the viewport itself
  onMount(() => {
    document.documentElement.style.overflowY = "auto"
    onCleanup(() => {
      document.documentElement.style.removeProperty("overflow-y")
    })
  })

  return (
    <main>
      <p>The dialog's scroll lock should apply to &lt;html&gt;, not &lt;body&gt;, on this page.</p>

      <button {...api().getTriggerProps()} data-testid="dialog-trigger">
        Open Dialog
      </button>

      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Dialog</h2>
              <p {...api().getDescriptionProps()}>Dialog content</p>
              <button {...api().getCloseTriggerProps()} data-testid="dialog-close">
                <XIcon />
              </button>
            </div>
          </div>
        </Portal>
      </Show>

      <Portal>
        <div data-testid="tall-content" style={{ height: "4000px" }} />
      </Portal>
    </main>
  )
}
