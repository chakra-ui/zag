"use client"

import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { Output } from "@/components/output"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
  { label: "Qwik", value: "qwik" },
  { label: "Lit", value: "lit" },
  { label: "Alpine.js", value: "alpinejs" },
  { label: "Ember", value: "ember" },
  { label: "Next.js", value: "nextjs" },
]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState<string[]>(["react"])
  const [options, setOptions] = useState(frameworks)

  const collection = useMemo(
    () =>
      combobox.collection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    value,
    onValueChange: (details) => setValue(details.value),
    // Reset on close so reopening shows every option, not the last filtered list
    onOpenChange: ({ open }) => {
      if (!open) setOptions(frameworks)
    },
    onInputValueChange: ({ inputValue, reason }) => {
      // Selection and external values also set the input; only typing should filter
      if (reason !== "input-change") return setOptions(frameworks)
      setOptions(frameworks.filter((item) => contains(item.label, inputValue)))
    },
    placeholder: "Type to search",
  })

  const api = combobox.connect(service, normalizeProps)

  // The selected item may be filtered out, so the external value must still resolve
  const setExternalValue = (next: string[]) => {
    setOptions(frameworks)
    setValue(next)
  }

  return (
    <main className="combobox">
      <div className="vstack gap-6">
        <div className="hstack">
          <button data-testid="set-solid-button" onClick={() => setExternalValue(["solid"])}>
            Set to Solid
          </button>
          <button onClick={() => setExternalValue(["svelte"])}>Set to Svelte</button>
          <button onClick={() => setExternalValue([])}>Clear</button>
        </div>

        <div className="hstack gap-4 items-start">
          <Output label="value" value={value} />
          <Output label="inputValue" value={api.inputValue} />
        </div>

        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Framework</label>
          <div {...api.getControlProps()}>
            <input data-testid="input" {...api.getInputProps()} />
            <button {...api.getClearTriggerProps()}>
              <XIcon />
            </button>
            <button data-testid="trigger" {...api.getTriggerProps()}>
              <ChevronsUpDownIcon />
            </button>
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <div data-testid="combobox-content" {...api.getContentProps()}>
            <div {...api.getEmptyProps()}>{options.length === 0 && "No frameworks found"}</div>
            {options.length > 0 && (
              <div {...api.getListProps()}>
                {options.map((item) => (
                  <div data-testid={item.value} key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>
                      <CheckIcon />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
