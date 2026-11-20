import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/presence.css"

export default function Page() {
  const [present, setPresent] = useState(true)

  const service = useMachine(presence.machine, { present })
  const api = presence.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="presence-reduced-motion">
          <p className="hint">
            With reduced motion on, the CSS drops the exit animation and the details unmount right away.
          </p>
          <button type="button" onClick={() => setPresent((value) => !value)}>
            {present ? "Hide details" : "Show details"}
          </button>
          {api.present && (
            <div
              ref={(node) => api.setNode(node)}
              className="details"
              data-testid="order-details"
              data-state={api.skip ? undefined : present ? "open" : "closed"}
            >
              <strong>Order #1042</strong>
              <p>2 items · Ships Thursday · Paid with Visa •••• 4242</p>
            </div>
          )}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
