import type { DateValue } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const [value, setValue] = useState<DateValue[]>([])

  const service = useMachine(dateInput.machine, {
    id: useId(),
    locale: "en-US",
    granularity: "minute",
    maxGranularity: "hour",
    hourCycle: 24,
    value,
    onValueChange: ({ value }) => setValue(value),
  })

  const api = dateInput.connect(service, normalizeProps)

  return (
    <>
      <main className="date-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Time</label>

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
          <div>Controlled value: {api.valueAsString.join(", ") || "-"}</div>
        </output>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
