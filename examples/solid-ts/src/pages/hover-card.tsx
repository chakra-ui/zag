import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId, Show } from "solid-js"
import { hoverCardControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Portal } from "solid-js/web"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const [state, send] = useMachine(hoverCard.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => hoverCard.connect(state, send, normalizeProps))

  return (
    <>
      <main class="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api().triggerProps}>
            Twitter
          </a>
          <Show when={api().isOpen}>
            <Portal>
              <div {...api().positionerProps}>
                <div {...api().contentProps}>
                  <div {...api().arrowProps}>
                    <div {...api().arrowTipProps} />
                  </div>
                  Twitter Preview
                  <a href="https://twitter.com/zag_js" target="_blank">
                    Twitter
                  </a>
                </div>
              </div>
            </Portal>
          </Show>
          <div data-part="test-text">Test text</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
