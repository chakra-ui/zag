import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"
import { combobox } from "@ui-machines/web"
import { createMemo } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { css } from "@emotion/css"
import { comboboxStyle } from "../../../../shared/style"
import { comboboxData } from "../../../../shared/data"

const styles = css(comboboxStyle)

function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "234",
      onSelect: console.log,
      selectionMode: "autoselect",
      closeOnSelect: (opt) => opt.label !== "Angola",
    }),
  )
  const ref = useSetup<HTMLDivElement>({ send, id: "32" })
  const machineState = createMemo(() => combobox.connect(state, send, normalizeProps))
  const filtered = createMemo(() => {
    return comboboxData.filter((d) => d.label.toLowerCase().startsWith(machineState().inputValue.toLowerCase()))
  })

  return (
    <div className={styles}>
      <div ref={ref} className="App">
        <StateVisualizer state={state} />
        <label {...machineState().labelProps}>Select country</label>
        <div {...machineState().containerProps}>
          <input {...machineState().inputProps} />
          <button {...machineState().buttonProps}>▼</button>
        </div>

        {filtered().length > 0 && (
          <ul style={{ width: 300, maxHeight: 400, overflow: "auto" }} {...machineState().listboxProps}>
            {filtered().map((item) => (
              <li {...machineState().getOptionProps({ label: item.label, value: item.code })}>{item.label}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Page
