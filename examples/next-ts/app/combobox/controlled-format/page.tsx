"use client"

import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"
import "@styles/combobox.css"

interface FieldProps {
  label: string
  items: string[]
  format: (value: string) => string
}

function Field(props: FieldProps) {
  const [inputValue, setInputValue] = useState("")

  const collection = useMemo(
    () => combobox.collection({ items: props.items.filter((item) => item.includes(inputValue)) }),
    [props.items, inputValue],
  )

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    inputValue,
    onInputValueChange(details) {
      setInputValue(props.format(details.inputValue))
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <div>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>{props.label}</label>
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
          <button {...api.getTriggerProps()}>▼</button>
        </div>
        <output>{inputValue}</output>
      </div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            {collection.items.map((item) => (
              <div key={item} {...api.getItemProps({ item })}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const digits = ["10001", "20002", "30003", "94105"]
const codes = ["ABC", "LAX", "NYC", "SFO"]

export default function Page() {
  return (
    <main className="combobox">
      <Field label="Digits" items={digits} format={(value) => value.replace(/\D/g, "")} />
      <Field label="Uppercase" items={codes} format={(value) => value.toUpperCase()} />
    </main>
  )
}
