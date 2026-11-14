import * as combobox from "@zag-js/combobox"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Highlight } from "~/components/highlight"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/combobox.css"

const matches = (text: string, query: string) => text.toLowerCase().includes(query.toLowerCase())

export default function Page() {
  const [query, setQuery] = createSignal("")
  const options = createMemo(() => comboboxData.filter((item) => matches(item.label, query())))

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const service = useMachine(combobox.machine, () => ({
    id: createUniqueId(),
    collection: collection(),
    onInputValueChange({ inputValue, reason }) {
      // A selected label or cleared input isn't a query
      setQuery(reason === "input-change" ? inputValue : "")
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select country</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} />
            <button {...api().getTriggerProps()}>▼</button>
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getEmptyProps()}>{options().length === 0 && "No results found"}</div>
            <Show when={options().length > 0}>
              <div {...api().getListProps()}>
                <For each={options()}>
                  {(item) => (
                    <div {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>
                        <Highlight text={item.label} query={query()} />
                      </span>
                      <span {...api().getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
