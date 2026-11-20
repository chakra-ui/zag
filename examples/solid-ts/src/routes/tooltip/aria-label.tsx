import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { createMemo, Show } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tooltip.css"

export default function Page() {
  const id = "tip-1"
  const service = useMachine(tooltip.machine, { id, "aria-label": "Save the document" })
  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <>
      <main class="tooltip">
        <div class="root">
          <button data-testid={`${id}-trigger`} {...api().getTriggerProps()}>
            Save
          </button>
          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api().getContentProps()}>
                  Save <kbd>⌘S</kbd>
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
