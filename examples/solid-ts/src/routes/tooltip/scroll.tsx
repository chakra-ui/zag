import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { Index, Show, createMemo, createUniqueId, type JSX } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/tooltip.css"

interface TooltipProps {
  children: JSX.Element
  closeOnPointerDown?: boolean
}

function Tooltip(props: TooltipProps) {
  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    positioning: { placement: "right" },
    openDelay: 100,
    closeDelay: 100,
    get closeOnPointerDown() {
      return props.closeOnPointerDown
    },
  })

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>{props.children}</button>
      <Portal>
        <Show when={api().open}>
          <div {...api().getPositionerProps()}>
            <div class="tooltip-content" {...api().getContentProps()}>
              <div {...api().getArrowProps()}>
                <div {...api().getArrowTipProps()} />
              </div>
              Tooltip
            </div>
          </div>
        </Show>
      </Portal>
    </>
  )
}

const items = Array.from({ length: 100 }, (_, idx) => idx)

export default function Page() {
  return (
    <main>
      <div class="root">
        <h2>Tooltip Scroll Hover Test</h2>
        <p>Hover over items, then scroll to see tooltips appear when cursor lands on items</p>
        <div
          style={{
            height: "400px",
            overflow: "auto",
            border: "1px solid #ccc",
            padding: "10px",
            "margin-top": "20px",
          }}
        >
          <Index each={items}>
            {(idx) => (
              <div style={{ padding: "10px", "border-bottom": "1px solid #eee" }}>
                <Tooltip closeOnPointerDown={true}>item {idx()}</Tooltip>
              </div>
            )}
          </Index>
        </div>
      </div>
    </main>
  )
}
