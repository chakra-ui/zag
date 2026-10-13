import { DateFormatter, type DateValue } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-input.css"

const timeFormatter = new DateFormatter("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export default function Page() {
  const [value, setValue] = createSignal<DateValue[]>([])

  const id = createUniqueId()
  const service = useMachine(dateInput.machine, (): dateInput.Props => ({
    id,
    locale: "en-US",
    granularity: "minute",
    hourCycle: 24,
    formatter: timeFormatter,
    value: value(),
    onValueChange: ({ value }) => setValue(value),
  }))

  const api = createMemo(() => dateInput.connect(service, normalizeProps))

  return (
    <>
      <main class="date-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Time</label>

          <div {...api().getControlProps()}>
            <div {...api().getSegmentGroupProps()}>
              <Index each={api().getSegments()}>
                {(segment) => <span {...api().getSegmentProps({ segment: segment() })}>{segment().text}</span>}
              </Index>
            </div>
          </div>

          <input {...api().getHiddenInputProps()} />
        </div>

        <output class="date-output">
          <div>Controlled value: {api().valueAsString.join(", ") || "-"}</div>
        </output>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
