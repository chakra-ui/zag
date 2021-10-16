/* eslint-disable jsx-a11y/label-has-associated-control */
import { combobox } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import * as styled from "@emotion/styled"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { comboboxData } from "../../../shared/data"
import { comboboxStyle } from "../../../shared/style"

const Styles = styled.default("div")(comboboxStyle as styled.CSSObject)

export default function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
      uid: "123",
      onSelect: console.log,
      selectionMode: "autocomplete",
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const {
    labelProps,
    inputProps,
    firstOptionLabel,
    inputValue,
    listboxProps,
    containerProps,
    buttonProps,
    getOptionProps,
  } = combobox.connect(state, send)

  const filtered = comboboxData.filter((d) => d.label.toLowerCase().startsWith(inputValue.toLowerCase()))

  return (
    <Styles>
      <div ref={ref}>
        <label {...labelProps}>Select country</label>
        <div {...containerProps} style={{ position: "relative" }}>
          {firstOptionLabel && (
            <span>
              <input
                style={{
                  position: "absolute",
                  color: "#b1b1b1",
                  appearance: "none",
                }}
                readOnly
                tabIndex={-1}
                value={inputValue + firstOptionLabel.substr(inputValue.length)}
              />
            </span>
          )}
          <input {...inputProps} style={{ position: "relative", background: "transparent" }} />
          {/* <button {...buttonProps}>▼</button> */}
        </div>

        {filtered.length > 0 && (
          <ul style={{ width: "300px", maxHeight: "400px", overflow: "auto" }} {...listboxProps}>
            {filtered.map((item) => (
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
