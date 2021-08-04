import { useMachine } from "@ui-machines/react"
import { comboboxMachine, connectComboboxMachine } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const data = [
  { label: "Angola", code: "AG" },
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
]

export default function Page() {
  const [state, send] = useMachine(
    comboboxMachine.withContext({
      uid: "234",
      onSelect: console.log,
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const {
    inputProps,
    inputValue,
    listboxProps,
    comboboxProps,
    getOptionProps,
  } = connectComboboxMachine(state, send)

  const filtered = data.filter((d) =>
    d.label.toLowerCase().includes(inputValue.toLowerCase()),
  )

  return (
    <>
      <div ref={ref} className="App">
        <StateVisualizer state={state} />
        <div {...comboboxProps}>
          <input {...inputProps} />
        </div>

        {filtered.length > 0 && (
          <ul style={{ width: 300 }} {...listboxProps}>
            {filtered.map((item) => (
              <li
                key={item.code}
                {...getOptionProps({ label: item.label, value: item.code })}
              >
                {item.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <style jsx>
        {`
          [role="listbox"] {
            list-style-type: none;
            padding: 0;
            margin: 0;
            border: 1px solid lightgray;
            max-width: 300px;
          }

          [role="option"][aria-selected="true"] {
            background-color: red;
            color: white;
          }
        `}
      </style>
    </>
  )
}
