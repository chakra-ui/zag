"use client"

import { createFilter } from "@zag-js/i18n-utils"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId, useMemo, useState } from "react"
import "@styles/select.css"

const { contains } = createFilter({ sensitivity: "base" })

interface Item {
  label: string
  value: string
}

export default function Page() {
  const [search, setSearch] = useState("")

  const collection = useMemo(() => {
    const items = selectData.filter((item) => contains(item.label, search))
    return select.collection({ items })
  }, [search])

  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection,
    popupType: "dialog",
    onOpenChange(details) {
      if (!details.open) setSearch("")
    },
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Country</label>
          <button {...api.getTriggerProps()}>
            <span {...api.getValueTextProps()}>{api.valueAsString || "Select country"}</span>
            <span {...api.getIndicatorProps()}>▼</span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <input
                {...api.getInputProps()}
                aria-label="Filter countries"
                placeholder="Filter…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div {...api.getListProps()}>
                {collection.items.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>

              <div {...api.getEmptyProps()}>{collection.size === 0 && `No matches for "${search}"`}</div>

              <div data-select-footer="">
                <span>
                  {collection.size} of {selectData.length}
                </span>
                {api.hasSelectedItems && (
                  <button type="button" onClick={() => api.clearValue()}>
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
