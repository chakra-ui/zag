import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useFocusTrap } from "~/hooks/use-focus-trap"

export default function Page() {
  const service = useMachine(floatingPanel.machine, { id: createUniqueId(), closeOnEscape: true })

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  let contentRef: HTMLDivElement | undefined

  useFocusTrap(() => contentRef, {
    get enabled() {
      return api().open
    },
  })

  return (
    <>
      <main class="floating-panel">
        <div>
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()} ref={contentRef}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()}>
                  <p {...api().getTitleProps()}>Floating Panel (Focus Trap)</p>
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
                <p>Focus is trapped within this panel when open.</p>
                <label>
                  Name
                  <input type="text" placeholder="Enter name" />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="Enter email" />
                </label>
                <button type="button">Submit</button>
              </div>

              <For each={floatingPanel.resizeTriggerPlacements}>
                {(placement) => <div {...api().getResizeTriggerProps({ placement })} />}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
