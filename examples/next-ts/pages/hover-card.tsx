import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { hoverCardControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const [state, send] = useMachine(
    hoverCard.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = hoverCard.connect(state, send, normalizeProps)

  return (
    <>
      <main className="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api.triggerProps}>
            Twitter
          </a>

          {api.isOpen && (
            <Portal>
              <div {...api.positionerProps}>
                <div className="hover-card-content" {...api.contentProps}>
                  <div {...api.arrowProps}>
                    <div {...api.innerArrowProps} />
                  </div>
                  Twitter Preview
                  <a href="https://twitter.com/zag_js" target="_blank">
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
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
