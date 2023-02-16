import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
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
          <button data-testid="clear-value-button" onClick={() => api().clearValue()}>
            Clear Value
          </button>
          <br />

          <div {...api().rootProps}>
            <label {...api().labelProps}>Select country</label>
            <div {...api().controlProps}>
              <input data-testid="input" {...api().inputProps} />
              <button data-testid="trigger" {...api().triggerProps}>
                ▼
              </button>
            </div>
          </div>

          <div {...api().positionerProps}>
            <Show when={options().length > 0}>
              <ul data-testid="combobox-content" {...api().contentProps}>
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
            </Show>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
