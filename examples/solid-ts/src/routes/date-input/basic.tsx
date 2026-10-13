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
    }),
  )

  const api = createMemo(() => dateInput.connect(service, normalizeProps))

  return (
    <>
      <main class="date-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Date</label>

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
          <div>Editing: {api().displayValues?.[0]?.toString() ?? "-"}</div>
        </output>
      </main>

      <Toolbar viz controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
