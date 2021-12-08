/* eslint-disable jsx-a11y/label-has-associated-control */
import styled from "@emotion/styled"
import * as Combobox from "@ui-machines/combobox"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"
import { useMemo, useState } from "react"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"

const Styles = styled.div(comboboxStyle)

export default function Page() {
  const controls = useControls({
    autoComplete: { type: "boolean", defaultValue: true },
    selectOnFocus: { type: "boolean", defaultValue: false },
    allowCustomValue: { type: "boolean", defaultValue: false },
    autoHighlight: { type: "boolean", defaultValue: false },
    loop: { type: "boolean", defaultValue: true },
  })

  const [options, setOptions] = useState(comboboxData)

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
    { context: controls.context },
  )

  const ref = useMount<HTMLDivElement>(send)

  const combobox = useMemo(() => Combobox.connect(state, send), [state, send])

  return (
    <>
      <div>
        <button onClick={() => combobox.setValue("Togo")}>Set to Togo</button>
      </div>

      <controls.ui />

      <Styles>
        <div ref={ref}>
          <label {...combobox.labelProps}>Select country</label>
          <div {...combobox.containerProps}>
            <input {...combobox.inputProps} />
            <button {...combobox.buttonProps}>▼</button>
          </div>

          {options.length > 0 && (
            <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...combobox.listboxProps}>
              {options.map((item, index) => (
                <li
                  key={`${item.code}:${index}`}
                  {...combobox.getOptionProps({ label: item.label, value: item.code, index })}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <StateVisualizer state={state} />
      </Styles>
    </>
  )
}
