import { tooltipControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { createMemo, Show } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/tooltip.css"

export default function Page() {
  const id = "tip-1"
  const controls = useControls(tooltipControls)
  const service = useMachine(tooltip.machine, controls.mergeProps<tooltip.Props>({ id }))
  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <>
      <main class="tooltip">
        <div class="root">
          <button data-testid={`${id}-trigger`} {...api().getTriggerProps()}>
            Hover me
          </button>
          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api().getContentProps()}>
                  Tooltip
                </div>
              </div>
            </Portal>
          </Show>
        </div>
      </main>
      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
