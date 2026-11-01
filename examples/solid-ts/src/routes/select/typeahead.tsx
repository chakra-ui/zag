import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon, XIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

export default function Page() {
  const service = useMachine(select.machine as select.Machine<Item>, {
    id: createUniqueId(),
    collection: select.collection<Item>({
      items: [
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana" },
        { label: "Cherry", value: "cherry" },
        { label: "Coconut", value: "coconut" },
        { label: "Date", value: "date" },
        { label: "Duck", value: "duck", disabled: true },
        { label: "Elephant", value: "elephant" },
        { label: "Fish", value: "fish" },
        { label: "Giraffe", value: "giraffe" },
        { label: "Hippo", value: "hippo" },
        { label: "Igloo", value: "igloo" },
      ],
    }),
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <main class="select">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Label</label>
        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps()}>
            <span>{api().valueAsString || "Select option"}</span>
          </button>
          <div class="select-indicator-group">
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
            <span {...api().getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </div>
        </div>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div {...api().getListProps()}>
                <For each={api().collection.items}>
                  {(item) => (
                    <div {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      <span {...api().getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
