import * as timePicker from "@zag-js/time-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId, type ParentProps } from "solid-js"
import { Portal } from "solid-js/web"
import { timePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function Wrapper(props: ParentProps) {
  return <Portal mount={document.body}>{props.children}</Portal>
}

export default function Page() {
  const controls = useControls(timePickerControls)

  const [state, send] = useMachine(timePicker.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => timePicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="time-picker">
        <div {...api().rootProps}>
          <div {...api().controlProps} style={{ display: "flex", gap: "10px" }}>
            <input {...api().inputProps} />
            <button {...api().triggerProps}>🗓</button>
            <button {...api().clearTriggerProps}>❌</button>
          </div>

          <Wrapper>
            <div {...api().positionerProps}>
              <div {...api().contentProps}>
                <div {...api().getColumnProps({ unit: "hour" })}>
                  <For each={api().getHours()}>
                    {(item) => <button {...api().getHourCellProps({ value: item.value })}>{item.label}</button>}
                  </For>
                </div>
                <div {...api().getColumnProps({ unit: "minute" })}>
                  <For each={api().getMinutes()}>
                    {(item) => <button {...api().getMinuteCellProps({ value: item.value })}>{item.label}</button>}
                  </For>
                </div>
                <div {...api().getColumnProps({ unit: "second" })}>
                  <For each={api().getSeconds()}>
                    {(item) => <button {...api().getSecondCellProps({ value: item.value })}>{item.label}</button>}
                  </For>
                </div>
                <div {...api().getColumnProps({ unit: "period" })}>
                  <button {...api().getPeriodCellProps({ value: "am" })}>AM</button>
                  <button {...api().getPeriodCellProps({ value: "pm" })}>PM</button>
                </div>
              </div>
            </div>
          </Wrapper>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
