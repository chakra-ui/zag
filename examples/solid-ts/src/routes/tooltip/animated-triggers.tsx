import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { Presence } from "~/components/presence"
import "@styles/tooltip-viewport.css"

const items = [
  { value: "bold", label: "Bold", tooltip: "Bold" },
  { value: "italic", label: "Italic", tooltip: "Italic text" },
  { value: "underline", label: "Underline", tooltip: "Underline the selected text" },
]

export default function Page() {
  const service = useMachine(tooltip.machine, {
    id: createUniqueId(),
    positioning: { placement: "top" },
  })

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <main class="tooltip animated-triggers">
      <div class="animated-triggers__list">
        <For each={items}>
          {(item) => <button {...api().getTriggerProps({ value: item.value })}>{item.label}</button>}
        </For>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence {...api().getArrowProps()}>
            <div {...api().getArrowTipProps()} />
          </Presence>
          <Presence {...api().getViewportProps()}>
            <For each={items}>
              {(item) => <Presence {...api().getContentProps({ value: item.value })}>{item.tooltip}</Presence>}
            </For>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
