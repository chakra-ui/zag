import * as presence from "@zag-js/presence"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/presence.css"

export default function Page() {
  const [present, setPresent] = createSignal(true)

  const service = useMachine(presence.machine, () => ({ present: present() }))
  const api = createMemo(() => presence.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="presence-reduced-motion">
          <p class="hint">
            With reduced motion on, the CSS drops the exit animation and the details unmount right away.
          </p>
          <button type="button" onClick={() => setPresent((value) => !value)}>
            {present() ? "Hide details" : "Show details"}
          </button>
          <Show when={api().present}>
            <div
              ref={(node) => api().setNode(node)}
              class="details"
              data-testid="order-details"
              data-state={api().skip ? undefined : present() ? "open" : "closed"}
            >
              <strong>Order #1042</strong>
              <p>2 items · Ships Thursday · Paid with Visa •••• 4242</p>
            </div>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
