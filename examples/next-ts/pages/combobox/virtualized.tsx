import { useVirtualizer } from "@tanstack/react-virtual"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { matchSorter } from "match-sorter"
import { useId, useRef, useState } from "react"

interface Item {
  code: string
  label: string
}

export default function Page() {
  const contentRef = useRef<HTMLDivElement>(null)

  const [options, setOptions] = useState(comboboxData)

  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 32,
  })

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center", behavior: "auto" })
    },
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Select country</label>
        <div {...api.getControlProps()}>
          <input data-testid="input" {...api.getInputProps()} />
          <button data-testid="trigger" {...api.getTriggerProps()}>
            ▼
          </button>
          <button {...api.getClearTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>

      <div {...api.getPositionerProps()}>
        <div data-testid="combobox-content" ref={contentRef} {...api.getContentProps()}>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = options[virtualItem.index]
              return (
                <div
                  data-testid={item.code}
                  key={item.code}
                  {...api.getItemProps({ item })}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  <span>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✅</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
