import { css } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, For } from "solid-js"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(comboboxStyle)

export default function Page() {
  const [state, send] = useMachine(
    Combobox.machine.withContext({
      uid: "123",
      onSelect: console.log,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const combobox = createMemo(() => Combobox.connect<SolidPropTypes>(state, send, normalizeProps))

  const filtered = createMemo(() => {
    return comboboxData.filter((d) => d.label.toLowerCase().startsWith(combobox().inputValue.toLowerCase()))
  })

  return (
    <div className={styles}>
      <div ref={ref}>
        <label {...combobox().labelProps}>Select country</label>
        <span {...combobox().containerProps}>
          <input {...combobox().inputProps} />
          <button {...combobox().buttonProps}>▼</button>
        </span>

        {filtered().length > 0 && (
          <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...combobox().listboxProps}>
            <For each={filtered()}>
              {(item) => <li {...combobox().getOptionProps({ label: item.label, value: item.code })}>{item.label}</li>}
            </For>
          </ul>
        )}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
