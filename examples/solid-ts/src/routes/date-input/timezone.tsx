import { parseZonedDateTime } from "@internationalized/date"
import * as dateInput from "@zag-js/date-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/date-input.css"

const timeZone = "America/Los_Angeles"

export default function Page() {
  const [hideTimeZone, setHideTimeZone] = createSignal(false)

  const id = createUniqueId()
  const defaultValue = [parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]")]

  const service = useMachine(dateInput.machine, () => ({
    id,
    locale: "en-US",
    granularity: "minute" as const,
    timeZone,
    hideTimeZone: hideTimeZone(),
    defaultValue,
  }))

  const api = createMemo(() => dateInput.connect(service, normalizeProps))

  return (
    <>
      <main class="date-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Meeting time</label>

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
          <div>Time zone: {timeZone}</div>
        </output>

        <label>
          <input
            type="checkbox"
            data-testid="hide-tz"
            checked={hideTimeZone()}
            onChange={(e) => setHideTimeZone(e.currentTarget.checked)}
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
