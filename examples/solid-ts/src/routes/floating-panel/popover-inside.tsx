import * as floatingPanel from "@zag-js/floating-panel"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-solid"
import { For, createMemo, createUniqueId, ParentProps } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(floatingPanel.machine, {
    id: createUniqueId(),
    closeOnEscape: true,
    defaultSize: { width: 400, height: 300 },
  })

  const api = createMemo(() => floatingPanel.connect(service, normalizeProps))

  return (
    <>
      <main class="floating-panel">
        <div>
          <button {...api().getTriggerProps()}>Toggle Panel</button>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getDragTriggerProps()}>
                <div {...api().getHeaderProps()}>
                  <p {...api().getTitleProps()}>Floating Panel (Nested Popover)</p>
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
                <p>Escape closes the popover first, then the panel.</p>
                <Popover />
              </div>

              <For each={floatingPanel.resizeTriggerAxes}>
                {(axis) => <div {...api().getResizeTriggerProps({ axis })} />}
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

function Wrapper(props: ParentProps<{ guard: boolean }>) {
  return <>{props.guard ? <Portal mount={document.body}>{props.children}</Portal> : props.children}</>
}

function Popover() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    portalled: false,
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <div>
      <button {...api().getTriggerProps()}>Open Popover</button>
      <Wrapper guard={api().portalled}>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getTitleProps()}>Nested Popover</div>
            <div {...api().getDescriptionProps()}>Press Escape to close this popover without closing the panel.</div>
            <button {...api().getCloseTriggerProps()}>Close Popover</button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
