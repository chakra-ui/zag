import * as floatingPanel from "@zag-js/floating-panel"
import { floatingPanelControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(floatingPanelControls)

  const [state, send] = useMachine(floatingPanel.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => floatingPanel.connect(state, send, normalizeProps))

  return (
    <>
      <main class="floating-panel">
        <div>
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()}>
                  <p {...api().getTitleProps()}>Floating Panel</p>
                  <div data-scope="floating-panel" data-part="trigger-group">
                    <button {...api().getMinimizeTriggerProps()}>
                      <Minus />
                    </button>
                    <button {...api().getMaximizeTriggerProps()}>
                      <Maximize2 />
                    </button>
                    <button {...api().getRestoreTriggerProps()}>
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

              <div {...api().getResizeTriggerProps({ axis: "n" })} />
              <div {...api().getResizeTriggerProps({ axis: "e" })} />
              <div {...api().getResizeTriggerProps({ axis: "w" })} />
              <div {...api().getResizeTriggerProps({ axis: "s" })} />
              <div {...api().getResizeTriggerProps({ axis: "ne" })} />
              <div {...api().getResizeTriggerProps({ axis: "se" })} />
              <div {...api().getResizeTriggerProps({ axis: "sw" })} />
              <div {...api().getResizeTriggerProps({ axis: "nw" })} />
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
