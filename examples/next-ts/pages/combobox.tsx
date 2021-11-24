/* eslint-disable jsx-a11y/label-has-associated-control */
import * as styled from "@emotion/styled"
import { combobox } from "@ui-machines/combobox"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"
import { useState } from "react"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"

const Styles = styled.default("div")(comboboxStyle as styled.CSSObject)

export default function Page() {
  const controls = useControls({
    autoComplete: { type: "boolean", defaultValue: true },
    selectOnFocus: { type: "boolean", defaultValue: false },
    allowCustomValue: { type: "boolean", defaultValue: true },
  })

  const [options, setOptions] = useState(comboboxData)

  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "123",
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange(value) {
        setOptions(comboboxData.filter((o) => o.label.toLowerCase().includes(value.toLowerCase())))
      },
    }),
    { context: controls.context },
  )

  const ref = useMount<HTMLDivElement>(send)

  const { labelProps, inputProps, buttonProps, listboxProps, containerProps, getOptionProps } = combobox.connect(
    state,
    send,
  )

  return (
    <>
      <controls.ui />
      <Styles>
        <div ref={ref}>
          <label {...labelProps}>Select country</label>
          <div {...containerProps}>
            <input {...inputProps} />
            <button {...buttonProps}>▼</button>
          </div>

          {options.length > 0 && (
            <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...listboxProps}>
              {options.map((item, index) => (
                <li key={`${item.code}:${index}`} {...getOptionProps({ label: item.label, value: item.code, index })}>
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
