import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"

export default function Page() {
  let boundaryRef: HTMLDivElement | undefined
  const [strategy, setStrategy] = createSignal<"fixed" | "absolute">("fixed")

  const id = createUniqueId()
  const service = useMachine(floatingPanel.machine, () => ({
    id,
    getBoundaryEl: () => boundaryRef ?? null,
    strategy: strategy(),
  }))

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  return (
    <main class="floating-panel">
      <div class="scroll-area" data-testid="scroller">
        <p>Scroll this area. The panel stays inside the dashed boundary.</p>
        <button onClick={() => setStrategy((s) => (s === "fixed" ? "absolute" : "fixed"))}>Toggle strategy</button>
        <p>strategy: {strategy()}</p>
        <div class="scroll-spacer" />
        <div class="boundary" ref={boundaryRef} data-testid="boundary">
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()}>
                  <p {...api().getTitleProps()}>Floating Panel</p>
                  <div {...api().getControlProps()}>
                    <button {...api().getStageTriggerProps({ stage: "minimized" })}>
                      <Minus />
                    </button>
                    <button {...api().getStageTriggerProps({ stage: "maximized" })}>
                      <Maximize2 />
                    </button>
                    <button {...api().getStageTriggerProps({ stage: "default" })}>
                      <ArrowDownLeft />
                    </button>
                    <button {...api().getCloseTriggerProps()}>
                      <XIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div {...api().getBodyProps()}>
                <p>Some content</p>
              </div>

              <For each={floatingPanel.resizeTriggerAxes}>
                {(axis) => <div {...api().getResizeTriggerProps({ axis })} />}
              </For>
            </div>
          </div>
        </div>
        <div class="scroll-spacer" />
      </div>
    </main>
  )
}
