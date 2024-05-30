import * as combobox from "@zag-js/combobox"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"

interface ComboboxProps {
  controls: {
    disabled: boolean
    readOnly: boolean
    blurOnSelect: boolean
    loop: boolean
  }
}

const comboboxData = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "Andorra", code: "AD" },
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

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)

export function Combobox(props: ComboboxProps) {
  const [options, setOptions] = useState(comboboxData)

  const collection = useMemo(
    () =>
      combobox.collection({
        items: options,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      onOpenChange() {
        setOptions(comboboxData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = comboboxData.filter((item) =>
          item.label.toLowerCase().includes(inputValue.toLowerCase()),
        )
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
      placeholder: "Type or select country",
    }),
    { context: { ...props.controls, collection } },
  )

  const api = combobox.connect(state, send, normalizeProps)

  return (
    <div>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Nationality</label>
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getTriggerProps()}>
            <CaretIcon />
          </button>
        </div>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          {options.length > 0 && (
            <ul {...api.getContentProps()}>
              {options.map((item, index) => (
                <li
                  key={`${item.code}:${index}`}
                  {...api.getItemProps({ item })}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Portal>
    </div>
  )
}
