import { css } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createSignal, For, createUniqueId } from "solid-js"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

const styles = css(comboboxStyle)

export default function Page() {
  const [options, setOptions] = createSignal(comboboxData)

  const [state, send] = useMachine(
    Combobox.machine.withContext({
      uid: "123",
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange(value) {
        const filtered = comboboxData.filter((o) => o.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const combobox = createMemo(() => Combobox.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div className={styles}>
      <div ref={ref}>
        <label {...combobox().labelProps}>Select country</label>
        <span {...combobox().containerProps}>
          <input {...combobox().inputProps} />
          <button {...combobox().buttonProps}>▼</button>
        </span>

        {options().length > 0 && (
          <ul style={{ width: "300px", "max-height": "400px", overflow: "auto" }} {...combobox().listboxProps}>
            <For each={options()}>
              {(item, index) => (
                <li {...combobox().getOptionProps({ label: item.label, value: item.code, index: index() })}>
                  {item.label}
                </li>
              )}
            </For>
          </ul>
        )}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
