import * as radio from "@zag-js/radio-group"
import { timeRanges } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = createSignal<string | null>("week")

  const service = useMachine(radio.machine, () => ({
    id: createUniqueId(),
    name: "range",
    orientation: "horizontal" as const,
    value: value(),
    onValueChange: (details: radio.ValueChangeDetails) => setValue(details.value),
  }))

  const api = createMemo(() => radio.connect(service, normalizeProps))
  const range = () => timeRanges.find((r) => r.id === value()) ?? timeRanges[1]
  const max = () => Math.max(...range().bars)

  return (
    <>
      <main>
        <div class="segmented-control time-range">
          <p class="hint">Switch the range to redraw the chart, or jump to Year with the button.</p>
          <div {...api().getRootProps()}>
            <div {...api().getIndicatorProps()} />
            <For each={timeRanges}>
              {(opt) => (
                <label data-testid={`radio-${opt.id}`} {...api().getItemProps({ value: opt.id })}>
                  <span {...api().getItemTextProps({ value: opt.id })}>{opt.label}</span>
                  <input {...api().getItemHiddenInputProps({ value: opt.id })} />
                </label>
              )}
            </For>
          </div>
          <div class="chart" data-testid="chart">
            <For each={range().bars}>
              {(bar) => <div class="bar" data-testid="bar" style={{ height: `${(bar / max()) * 100}%` }} />}
            </For>
          </div>
          <p class="caption" data-testid="caption" role="status">
            {range().caption}
          </p>
          <div class="actions">
            <button type="button" onClick={() => setValue("year")}>
              Jump to Year
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
