import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { createMemo, createSignal, For } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

const Select = (props: { id: string }) => {
  const [open, setOpen] = createSignal(false)

  const service = useMachine(select.machine, () => ({
    collection: select.collection({ items: selectData }),
    id: props.id,
    name: "country",
    open: open(),
    onOpenChange: (details) => setOpen(details.open),
  }))

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <button {...api().getTriggerProps()}>
          <span>{api().valueAsString || "Select option"}</span>
          <span {...api().getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>
      <Portal>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={selectData}>
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
  )
}

export default function Page() {
  return (
    <main class="select">
      <div style={{ display: "flex", gap: "4px" }}>
        <Select id="a" />
        <Select id="b" />
      </div>
    </main>
  )
}
