import { chakra } from "@chakra-ui/system"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId, useState } from "react"

type ComboboxProps = {
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
  { label: "AndorrA", code: "AD" },
  { label: "Angola", code: "AO" },
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

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      onOpen() {
        setOptions(comboboxData)
      },
      onInputChange({ value }) {
        const filtered = comboboxData.filter((item) =>
          item.label.toLowerCase().includes(value.toLowerCase()),
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
      <chakra.div
        display="flex"
        flexDirection="column"
        gap="1"
        {...api.rootProps}
      >
        <chakra.label
          fontSize="lg"
          _disabled={{
            opacity: 0.6,
          }}
          {...api.labelProps}
        >
          Nationality
        </chakra.label>
        <chakra.div
          display="inline-flex"
          width="300px"
          className="focus-outline"
          bg="bg-subtle"
          borderWidth="1px"
          _disabled={{
            opacity: 0.6,
          }}
          py="1"
          px="3"
          {...api.controlProps}
        >
          <chakra.input
            bg="bg-subtle"
            _focus={{ outline: "0" }}
            flex="1"
            p="1"
            {...api.inputProps}
          />
          <button {...api.triggerProps}>
            <CaretIcon />
          </button>
        </chakra.div>
      </chakra.div>
      <Portal>
        <div {...api.positionerProps}>
          {options.length > 0 && (
            <chakra.ul
              listStyleType="none"
              m="0"
              maxH="56"
              overflow="auto"
              shadow="base"
              isolation="isolate"
              p="2"
              bg="bg-subtle"
              {...api.contentProps}
            >
              {options.map((item, index) => (
                <chakra.li
                  px="2"
                  py="1"
                  display="flex"
                  alignItems="center"
                  cursor="pointer"
                  _highlighted={{ bg: "bg-primary-subtle", color: "white" }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "unset",
                  }}
                  key={`${item.code}:${index}`}
                  {...api.getItemProps({ item })}
                >
                  {item.label}
                </chakra.li>
              ))}
            </chakra.ul>
          )}
        </div>
      </Portal>
    </div>
  )
}
