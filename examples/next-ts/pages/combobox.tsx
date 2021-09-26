/* eslint-disable jsx-a11y/label-has-associated-control */
import { useMachine } from "@ui-machines/react"
import { combobox } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import styled from "@emotion/styled"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"

const Styles = styled("div")(comboboxStyle)

export default function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "234",
      onSelect: console.log,
      selectionMode: "autoselect",
      closeOnSelect: (opt) => opt.label !== "Angola",
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { labelProps, inputProps, inputValue, listboxProps, containerProps, buttonProps, getOptionProps } =
    combobox.connect(state, send)

  const filtered = comboboxData.filter((d) => d.label.toLowerCase().startsWith(inputValue.toLowerCase()))

  return (
    <Styles>
      <div ref={ref} className="App">
        <StateVisualizer state={state} />
        <label {...labelProps}>Select country</label>
        <div {...containerProps}>
          <input {...inputProps} />
          <button {...buttonProps}>▼</button>
        </div>

        {filtered.length > 0 && (
          <ul style={{ width: 300, maxHeight: 400, overflow: "auto" }} {...listboxProps}>
            {filtered.map((item) => (
              <li key={item.code} {...getOptionProps({ label: item.label, value: item.code })}>
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Styles>
  )
}
