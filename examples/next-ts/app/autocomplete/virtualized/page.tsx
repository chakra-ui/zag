"use client"

import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { useId, useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState("")
  const items = comboboxData.filter((item) => contains(item.label, value))

  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    itemSize: 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(autocomplete.machine as autocomplete.Machine<Item>, {
    id: useId(),
    collection: autocomplete.collection({
      items,
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
    placeholder: "Search countries",
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: details.immediate ? "center" : "auto" })
    },
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <main className="autocomplete">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Country</label>
        <div {...api.getControlProps()}>
          <input {...api.getInputProps()} />
        </div>
      </div>

      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getEmptyProps()}>No countries match</div>
          <div {...mergeProps(virtualizer.getRootProps(), api.getListProps())} ref={ref}>
            <div {...virtualizer.getContentProps()}>
              {virtualizer.getVirtualItems().map((vi) => {
                const item = items[vi.index]
                // The count syncs before paint; skip rows from the previous one
                if (!item) return null
                return (
                  <div key={item.code} {...mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item }))}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
