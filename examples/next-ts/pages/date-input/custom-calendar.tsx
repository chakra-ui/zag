import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

import { PersianCalendar } from "@internationalized/date"

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
    id: useId(),
    locale: "fa-IR",
    createCalendar,
  })

  const api = dateInput.connect(service, normalizeProps)

  return (
    <>
      <main className="date-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>تاریخ</label>

          <div {...api.getControlProps()}>
            <div {...api.getSegmentGroupProps()}>
              {api.getSegments().map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment })}>
                  {segment.text}
                </span>
              ))}
            </div>
          </div>

          <input {...api.getHiddenInputProps()} />
        </div>

        <output className="date-output">
          <div>Selected: {api.valueAsString.join(", ") || "-"}</div>
          <div>Placeholder: {api.placeholderValue.toString()}</div>
        </output>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
