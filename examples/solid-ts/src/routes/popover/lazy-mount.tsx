import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/popover.css"

export default function Page() {
  const service = useMachine(popover.machine, { id: createUniqueId() })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <>
      <main class="popover">
        <div data-part="root">
          <button data-testid="popover-trigger" {...api().getTriggerProps()}>
            Click me
          </button>

          <div {...api().getPositionerProps()}>
            <Show when={api().open}>
              <div data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
                <div data-testid="popover-title" {...api().getTitleProps()}>
                  Popover Title
                </div>
                <div data-testid="popover-description" {...api().getDescriptionProps()}>
                  Popover Description
                </div>
                <button data-testid="popover-close-button" {...api().getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </div>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
