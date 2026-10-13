import { PersianCalendar } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-input.css"

function createCalendar(identifier: string) {
  switch (identifier) {
    case "persian":
      return new PersianCalendar()
    default:
      throw new Error(`Unsupported calendar: ${identifier}`)
  }
}

export default function Page() {
  const service = useMachine(dateInput.machine, {
    id: createUniqueId(),
    locale: "fa-IR",
    createCalendar,
  })

  const api = createMemo(() => dateInput.connect(service, normalizeProps))

  return (
    <>
      <main class="date-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>تاریخ</label>

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
          <div>Selected: {api().valueAsString.join(", ") || "-"}</div>
          <div>Placeholder: {api().placeholderValue.toString()}</div>
        </output>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
