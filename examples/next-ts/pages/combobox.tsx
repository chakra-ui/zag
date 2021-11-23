/* eslint-disable jsx-a11y/label-has-associated-control */
import * as styled from "@emotion/styled"
import { combobox } from "@ui-machines/combobox"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"

const Styles = styled.default("div")(comboboxStyle as styled.CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "123",
      onSelectionChange: console.log,
      autoComplete: false,
      selectOnFocus: true,
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { inputValue, labelProps, inputProps, buttonProps, listboxProps, containerProps, getOptionProps } =
    combobox.connect(state, send)

  const options = comboboxData.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase()))

  return (
    <Styles>
      <div ref={ref}>
        <label {...labelProps}>Select country</label>
        <div {...containerProps}>
          <input {...inputProps} />
          <button {...buttonProps}>▼</button>
        </div>

        {options.length > 0 && (
          <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...listboxProps}>
            {options.map((item) => (
              <li key={item.code} {...getOptionProps({ label: item.label, value: item.code })}>
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <StateVisualizer state={state} />
    </Styles>
  )
}
