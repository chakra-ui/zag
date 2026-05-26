import { parseZonedDateTime } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const timeZone = "America/Los_Angeles"

export default function Page() {
  const [hideTimeZone, setHideTimeZone] = useState(false)

  const service = useMachine(dateInput.machine, {
    id: useId(),
    locale: "en-US",
    granularity: "minute",
    timeZone,
    hideTimeZone,
    defaultValue: [parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]")],
  })

  const api = dateInput.connect(service, normalizeProps)

  return (
    <>
      <main className="date-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Meeting time</label>

          <div {...api.getControlProps()}>
            <div {...api.getSegmentGroupProps()}>
              {api.getSegments().map((segment, i) => (
                <span key={i} {...api.getSegmentProps({ segment })} suppressHydrationWarning>
                  {segment.text}
                </span>
              ))}
            </div>
          </div>

          <input {...api.getHiddenInputProps()} />
        </div>

        <output className="date-output">
          <div>Selected: {api.valueAsString.join(", ") || "-"}</div>
          <div>Time zone: {timeZone}</div>
        </output>

        <label style={{ display: "block", marginTop: "12px" }}>
          <input
            type="checkbox"
            data-testid="hide-tz"
            checked={hideTimeZone}
            onChange={(e) => setHideTimeZone(e.target.checked)}
          />{" "}
          Hide time zone
        </label>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
