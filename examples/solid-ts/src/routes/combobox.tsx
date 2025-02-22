import * as combobox from "@zag-js/combobox"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { matchSorter } from "match-sorter"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = createSignal(comboboxData)

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const [value, setValue] = createSignal<string[]>([])

  const service = useMachine(
    combobox.machine,
    controls.mergeProps<combobox.Props>(() => ({
      id: createUniqueId(),
      value: value(),
      onValueChange({ value }) {
        setValue(value)
      },
      collection: collection(),
      onOpenChange() {
        setOptions(comboboxData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = matchSorter(comboboxData, inputValue, { keys: ["label"] })
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    })),
  )

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <pre>{JSON.stringify(service.state.get(), null, 2)}</pre>
        <div>
          <button onClick={() => setValue(["TG"])}>Set to Togo</button>
          <button data-testid="clear-value-button" onClick={() => api().clearValue()}>
            Clear Value
          </button>
          <br />

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
            <Show when={options().length > 0}>
              <ul data-testid="combobox-content" {...api().getContentProps()}>
                <Index each={options()}>
                  {(item) => (
                    <li class="combobox__option" {...api().getItemProps({ item: item() })}>
                      {item().label}
                    </li>
                  )}
                </Index>
              </ul>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
