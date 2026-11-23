import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { autocompleteControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls(autocompleteControls)
  const [value, setValue] = createSignal("")
  const [submitted, setSubmitted] = createSignal<string | null>(null)

  // `list` and `both` show suggestions that match the text
  const items = createMemo(() => {
    const mode = controls.state().mode
    const filtered = mode === "list" || mode === "both"
    return filtered ? comboboxData.filter((item) => contains(item.label, value())) : comboboxData
  })

  const collection = createMemo(() =>
    autocomplete.collection<Item>({
      items: items(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(
    autocomplete.machine as autocomplete.Machine<Item>,
    controls.mergeProps<autocomplete.Props<Item>>(() => ({
      id,
      collection: collection(),
      name: "country",
      placeholder: "Search countries",
      value: value(),
      onValueChange: (details) => setValue(details.value),
    })),
  )

  const api = createMemo(() => autocomplete.connect(service, normalizeProps))

  return (
    <>
      <main class="autocomplete">
        <form
          class="autocomplete-form"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(String(new FormData(event.currentTarget).get("country")))
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Country</label>
            <div {...api().getControlProps()}>
              <input {...api().getInputProps()} />
              <button {...api().getClearTriggerProps()}>
                <XIcon />
              </button>
              <button {...api().getTriggerProps()}>▼</button>
            </div>
          </div>
          <button type="submit">Submit</button>
        </form>

        <pre data-testid="output">
          value: {JSON.stringify(api().value)}
          {"\n"}submitted: {submitted() == null ? "—" : JSON.stringify(submitted())}
        </pre>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getEmptyProps()}>No countries match</div>
            <ul {...api().getListProps()}>
              <For each={items()}>
                {(item) => (
                  <li {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
