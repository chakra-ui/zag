import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxData } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId, useState } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = useState(comboboxData)

  const { virtualizer, ref } = useListVirtualizer({
    count: comboboxData.length,
    estimatedSize: () => 32,
    observeScrollElementSize: true,
  })

  // Sync count before render — useEffect is too late
  virtualizer.updateOptions({ count: options.length })

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "center" })
    },
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
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
        <div data-testid="combobox-content" {...api.getContentProps()}>
          <div {...api.getListProps()} ref={ref} onScroll={virtualizer.handleScroll}>
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
              {virtualizer.getVirtualItems().map((vi) => {
                const item = options[vi.index]
                return (
                  <div
                    data-testid={item.code}
                    key={item.code}
                    {...api.getItemProps({ item })}
                    style={{
                      ...virtualizer.getItemStyle(vi),
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
      </div>
    </main>
  )
}
