import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/utils/search"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

const { contains } = createFilter({ sensitivity: "base" })

// Fake server: slow, abortable, and rejects labels starting with "x"
function saveLabel(label: string, signal: AbortSignal) {
  return new Promise<Item>((resolve, reject) => {
    const timer = setTimeout(() => {
      if (/^x/i.test(label)) reject(new Error(`"${label}" is reserved`))
      else resolve(toItem(label))
    }, 800)
    signal.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })
}

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const [query, setQuery] = createSignal("")

  const filtered = createMemo(() => items().filter((item) => contains(item.label, query().trim())))

  const collection = createMemo(() =>
    combobox.collection({
      items: filtered(),
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
    autoHighlight: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") setQuery("")
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason !== "input-change") return
      setQuery(inputValue)
    },
    async onCreate({ inputValue, signal }) {
      const item = await saveLabel(inputValue, signal)
      setItems((prev) => [...prev, item])
      return item.value
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))
  const create = createMemo(() => api().getCreateItemState())

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} placeholder="Search or create" />
            <button {...api().getTriggerProps()}>▼</button>
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <pre data-testid="value">value: {JSON.stringify(api().value)}</pre>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={filtered()}>
                {(item) => (
                  <div {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </div>
                )}
              </For>
              <div {...api().getCreateItemProps()}>
                <span>
                  {create().pending ? `Creating "${create().inputValue}"…` : `Create "${create().inputValue}"`}
                </span>
                <Show when={create().error}>
                  <span class="combobox-create-error">{create().error?.message}</span>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
