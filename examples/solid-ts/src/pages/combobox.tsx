import { injectGlobal } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { comboboxControls } from "../../../../shared/controls"
import { comboboxData } from "../../../../shared/data"
import { comboboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(comboboxStyle)

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = createSignal(comboboxData)

  const [state, send] = useMachine(
    Combobox.machine.withContext({
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange(value) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    { context: controls.context },
  )

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => Combobox.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div>
        <button onClick={() => api().setValue("Togo")}>Set to Togo</button>
        <br />

        <div ref={ref} {...api().rootProps}>
          <label {...api().labelProps}>Select country</label>

          <div {...api().controlProps}>
            <input {...api().inputProps} />
            <button {...api().toggleButtonProps}>▼</button>
          </div>
        </div>

        <div {...api().positionerProps}>
          {options().length > 0 && (
            <ul {...api().listboxProps}>
              <For each={options()}>
                {(item, index) => {
                  const options = { label: item.label, value: item.code, index: index(), disabled: item.disabled }
                  return (
                    <li className="combobox__option" {...api().getOptionProps(options)}>
                      {item.label}
                    </li>
                  )
                }}
              </For>
            </ul>
          )}
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
