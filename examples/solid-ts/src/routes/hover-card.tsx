import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const service = useMachine(hoverCard.machine, { id: createUniqueId() })

  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <>
      <main class="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api().getTriggerProps()}>
            Twitter
          </a>
          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div {...api().getContentProps()}>
                  <div {...api().getArrowProps()}>
                    <div {...api().getArrowTipProps()} />
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
