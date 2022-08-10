import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = createSignal(comboboxData)

  const [state, send] = useMachine(
    combobox.machine({
      id: createUniqueId(),
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange({ value }) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    { context: controls.context },
  )

  const api = createMemo(() => combobox.connect(state, send, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div>
          <button onClick={() => api().setValue("Togo")}>Set to Togo</button>
          <br />
          <div {...api().rootProps}>
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
                      <li class="combobox__option" {...api().getOptionProps(options)}>
                        {item.label}
                      </li>
                    )
                  }}
                </For>
              </ul>
            )}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
