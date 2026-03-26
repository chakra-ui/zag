import styles from "../../../../../shared/src/css/floating-panel.module.css"
import * as floatingPanel from "@zag-js/floating-panel"
import { floatingPanelControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(floatingPanelControls)

  const service = useMachine(floatingPanel.machine, { id: createUniqueId() })

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  return (
    <>
      <main class="floating-panel">
        <div>
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()} class={styles.Content}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()} class={styles.Header}>
                  <p {...api().getTitleProps()}>Floating Panel</p>
                  <div {...api().getControlProps()} class={styles.Control}>
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
              <div {...api().getBodyProps()} class={styles.Body}>
                <p>Some content</p>
              </div>

              <For each={floatingPanel.resizeTriggerAxes}>
                {(axis) => <div {...api().getResizeTriggerProps({ axis })} class={styles.ResizeTrigger} />}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
