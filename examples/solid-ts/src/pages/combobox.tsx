import { injectGlobal } from "@emotion/css"
import * as Combobox from "@ui-machines/combobox"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
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

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const combobox = createMemo(() => Combobox.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="root">
        <button onClick={() => combobox().setValue("Togo")}>Set to Togo</button>
        <br />

        <div className="combobox">
          <label className="combobox__label" {...combobox().labelProps}>
            Select country
          </label>

          <div className="combobox__container" ref={ref} {...combobox().containerProps}>
            <input {...combobox().inputProps} />
            <button {...combobox().buttonProps}>▼</button>
          </div>

          <div className="combobox__popover">
            {options().length > 0 && (
              <ul className="combobox__listbox" {...combobox().listboxProps}>
                <For each={options()}>
                  {(item, index) => (
                    <li
                      className="combobox__option"
                      {...combobox().getOptionProps({ label: item.label, value: item.code, index: index() })}
                    >
                      {item.label}
                    </li>
                  )}
                </For>
              </ul>
            )}
          </div>
        </div>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
