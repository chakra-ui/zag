import { useMachine } from "@ui-machines/react"
import { combobox } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const data = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "AndorrA", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Anguilla", code: "AI" },
  { label: "Antarctica", code: "AQ" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tokelau", code: "TK" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
]

export default function Page() {
  const [state, send] = useMachine(
    combobox.machine.withContext({
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
    buttonProps,
    getOptionProps,
  } = combobox.connect(state, send)

  const filtered = data.filter((d) =>
    d.label.toLowerCase().startsWith(inputValue.toLowerCase()),
  )

  return (
    <>
      <div ref={ref} className="App">
        <StateVisualizer state={state} />
        <div {...comboboxProps}>
          <input {...inputProps} />
          <button {...buttonProps}>▼</button>
        </div>

        {filtered.length > 0 && (
          <ul
            style={{ width: 300, maxHeight: 400, overflow: "auto" }}
            {...listboxProps}
          >
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
    </>
  )
}
