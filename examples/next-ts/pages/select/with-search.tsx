import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId, useMemo, useRef, useState } from "react"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const collection = useMemo(() => {
    const items = selectData.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    return select.collection({ items })
  }, [search])

  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection,
    initialFocusEl: () => inputRef.current,
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
            <span>{api.valueAsString || "Select country"}</span>
            <span {...api.getIndicatorProps()}>▼</span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps({ role: "dialog" })}>
              <input
                ref={inputRef}
                data-select-search=""
                value={search}
                placeholder="Filter…"
                spellCheck={false}
                autoComplete="off"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Home" || e.key === "End") e.stopPropagation()
                }}
              />

              <div {...api.getListProps()}>
                {collection.items.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>

              {collection.size === 0 && (
                <div data-select-empty="" role="status">
                  No matches for "{search}"
                </div>
              )}

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
