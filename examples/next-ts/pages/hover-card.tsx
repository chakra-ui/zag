import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { hoverCardControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const service = useMachine(hoverCard.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <>
      <main className="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api.getTriggerProps()}>
            Twitter
          </a>

          {api.open && (
            <Portal>
              <div {...api.getPositionerProps()}>
                <div {...api.getContentProps()}>
                  <div {...api.getArrowProps()}>
                    <div {...api.getArrowTipProps()} />
                  </div>
                  Twitter Preview
                  <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                    Twitter
                  </a>
                </div>
              </div>
            </Portal>
          )}

          <div data-part="test-text">Test text</div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
