import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Index, createComputed, createMemo, createSignal, createUniqueId, on } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = createSignal(comboboxData)

  const { virtualizer, ref } = useListVirtualizer({
    count: comboboxData.length,
    estimatedSize: () => 32,
    observeScrollElementSize: true,
  })

  // Sync count before render
  createComputed(
    on(
      () => options().length,
      (count) => virtualizer.updateOptions({ count }),
    ),
  )

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
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
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Select country</label>
        <div {...api().getControlProps()}>
          <input data-testid="input" {...api().getInputProps()} />
          <button data-testid="trigger" {...api().getTriggerProps()}>
            ▼
          </button>
          <button {...api().getClearTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>

      <div {...api().getPositionerProps()}>
        <div data-testid="combobox-content" {...api().getContentProps()}>
          <div {...api().getListProps()} ref={ref} onScroll={virtualizer.handleScroll}>
            <div style={{ height: `${virtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
              <Index each={virtualizer.getVirtualItems()}>
                {(vi) => {
                  const item = () => options()[vi().index]
                  return (
                    <div
                      data-testid={item().code}
                      {...api().getItemProps({ item: item() })}
                      style={{
                        ...virtualizer.getItemStyle(vi()),
                        "white-space": "nowrap",
                        overflow: "hidden",
                        "text-overflow": "ellipsis",
                      }}
                    >
                      <span>{item().label}</span>
                      <span {...api().getItemIndicatorProps({ item: item() })}>✅</span>
                    </div>
                  )
                }}
              </Index>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
