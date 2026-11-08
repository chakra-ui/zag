import * as radio from "@zag-js/radio-group"
import { alignOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: createUniqueId(),
    name: "align",
    orientation: "horizontal",
    defaultValue: "left",
  })

  const api = createMemo(() => radio.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="segmented-control icon-only">
          <p class="hint">Pick an alignment. Each icon is named for screen readers.</p>
          <div {...api().getRootProps()}>
            <div {...api().getIndicatorProps()} />
            <For each={alignOptions}>
              {(opt) => (
                <label data-testid={`radio-${opt.id}`} {...api().getItemProps({ value: opt.id })}>
                  <span aria-label={opt.label} {...api().getItemTextProps({ value: opt.id })}>
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d={opt.icon} />
                    </svg>
                  </span>
                  <input {...api().getItemHiddenInputProps({ value: opt.id })} />
                </label>
              )}
            </For>
          </div>
          <p class="preview" data-testid="preview" data-align={api().value}>
            Orders placed before 3pm ship the same day. Delivery windows are estimates and may change during peak
            periods.
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
