import * as dateInput from "@zag-js/date-input"
import { dateInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/date-input.css"

export default function Page() {
  const controls = useControls(dateInputControls)
  const service = useMachine(
    dateInput.machine,
    controls.mergeProps<dateInput.Props>({
      id: createUniqueId(),
      selectionMode: "range",
    }),
  )

  const api = createMemo(() => dateInput.connect(service, normalizeProps))

  return (
    <>
      <main class="date-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Date Range</label>

          <div {...api().getControlProps()}>
            <div {...api().getSegmentGroupProps({ index: 0 })}>
              <Index each={api().getSegments({ index: 0 })}>
                {(segment) => (
                  <span {...api().getSegmentProps({ segment: segment(), index: 0 })}>{segment().text}</span>
                )}
              </Index>
            </div>

            <span> &ndash; </span>

            <div {...api().getSegmentGroupProps({ index: 1 })}>
              <Index each={api().getSegments({ index: 1 })}>
                {(segment) => (
                  <span {...api().getSegmentProps({ segment: segment(), index: 1 })}>{segment().text}</span>
                )}
              </Index>
            </div>
          </div>

          <input {...api().getHiddenInputProps({ index: 0 })} />
          <input {...api().getHiddenInputProps({ index: 1 })} />
        </div>

        <output class="date-output">
          <div>Selected: {api().valueAsString.join(" - ") || "-"}</div>
          <div>Placeholder: {api().placeholderValue.toString()}</div>
          <Index each={api().displayValues ?? []}>
            {(date, index) => (
              <div>
                Editing input {index + 1}: {date().toString() ?? "-"}
              </div>
            )}
          </Index>
        </output>
      </main>

      <Toolbar viz controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
