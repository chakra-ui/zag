import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { defineControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const localeControls = defineControls({
  locale: {
    type: "select",
    options: ["en-US", "en-GB", "fr-FR", "de-DE", "cs-CZ", "ja-JP", "mk-MK", "zh-CN"] as const,
    defaultValue: "en-US",
  },
})

export default function Page() {
  const controls = useControls(localeControls)
  const service = useMachine(dateInput.machine, {
    id: useId(),
    locale: controls.context.locale,
    granularity: "minute",
    maxGranularity: "hour",
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
          <div>Selected: {api.valueAsString.join(", ") || "-"}</div>
        </output>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
