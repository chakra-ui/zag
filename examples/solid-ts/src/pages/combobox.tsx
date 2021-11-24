import { combobox } from "@ui-machines/combobox"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo, For } from "solid-js"
import { css, CSSObject } from "@emotion/css"

import { StateVisualizer } from "../components/state-visualizer"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"

const styles = css(comboboxStyle as CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "123",
      onSelectionChange: console.log,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => combobox.connect<SolidPropTypes>(state, send, normalizeProps))

  const filtered = createMemo(() => {
    return comboboxData.filter((d) => d.label.toLowerCase().startsWith(machineState().inputValue.toLowerCase()))
  })

  return (
    <div className={styles}>
      <div ref={ref}>
        <label {...machineState().labelProps}>Select country</label>
        <span {...machineState().containerProps}>
          <input {...machineState().inputProps} />
          <button {...machineState().buttonProps}>▼</button>
        </span>

        {filtered().length > 0 && (
          <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...machineState().listboxProps}>
            <For each={filtered()}>
              {(item) => (
                <li {...machineState().getOptionProps({ label: item.label, value: item.code })}>{item.label}</li>
              )}
            </For>
          </ul>
        )}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
