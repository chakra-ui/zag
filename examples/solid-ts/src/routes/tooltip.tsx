import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { createMemo, createUniqueId, Show } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const [state, send] = useMachine(tooltip.machine({ id: createUniqueId() }))
  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))

  const [state2, send2] = useMachine(tooltip.machine({ id: createUniqueId() }))
  const api2 = createMemo(() => tooltip.connect(state2, send2, normalizeProps))

  return (
    <>
      <main class="tooltip" style={{ gap: "12px", "flex-direction": "row" }}>
        <div class="root">
          <button data-testid="tip-1-trigger" {...api().getTriggerProps()}>
            Hover me
          </button>

          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div class="tooltip-content" data-testid="tip-1-tooltip" {...api().getContentProps()}>
                  Tooltip
                </div>
              </div>
            </Portal>
          </Show>

          <button data-testid="tip-2-trigger" {...api2().getTriggerProps()}>
            Over me
          </button>

          <Show when={api2().open}>
            <Portal>
              <div {...api2().getPositionerProps()}>
                <div class="tooltip-content" data-testid="tip-2-tooltip" {...api2().getContentProps()}>
                  Tooltip 2
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
        <StateVisualizer state={state2} />
      </Toolbar>
    </>
  )
}
