import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/hover-card.css"

export default function Page() {
  const service = useMachine(hoverCard.machine, { id: createUniqueId(), openDelay: 300 })
  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <>
      <main class="hover-card">
        <p style={{ "max-width": "360px", "line-height": 2, "font-size": "15px" }}>
          Zag is built on{" "}
          <a href="#" data-testid="wrapped-trigger" {...api().getTriggerProps({ value: "a" })}>
            a set of framework agnostic state machines that describe every interaction a component supports, so the same
            logic runs everywhere
          </a>{" "}
          and behaves identically. Every machine ships{" "}
          <a href="#" data-testid="wrapped-trigger-2" {...api().getTriggerProps({ value: "b" })}>
            keyboard interactions and ARIA attributes that follow the authoring practices, tested across all the
            supported frameworks
          </a>{" "}
          before release.
        </p>

        <Show when={api().open}>
          <Portal>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <div {...api().getArrowProps()}>
                  <div {...api().getArrowTipProps()} />
                </div>
                Anchored to {api().triggerValue}
                {/* Switches without the pointer reaching the other trigger. */}
                <button
                  data-testid="switch-trigger"
                  onClick={() => api().setTriggerValue(api().triggerValue === "a" ? "b" : "a")}
                >
                  Switch
                </button>
              </div>
            </div>
          </Portal>
        </Show>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
