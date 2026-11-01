import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls({
    removeSelected: {
      type: "boolean",
      defaultValue: false,
    },
  })

  const [options, setOptions] = createSignal(comboboxData)
  const [selectedValue, setSelectedValue] = createSignal<string[]>([])

  const items = createMemo(() => {
    const removeSelected = controls.state().removeSelected
    return removeSelected ? options().filter((item) => !selectedValue().includes(item.code)) : options()
  })

  const collection = createMemo(() =>
    combobox.collection({
      items: items(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, () => ({
    id,
    collection: collection(),
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
    multiple: true,
    onValueChange({ value }) {
      setSelectedValue(value)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div>
          <b>{service.state.get()}</b>
          <b> / {api().highlightedValue || "-"}</b>
          <pre data-testid="value-text">{api().valueAsString}</pre>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Select country</label>
            <div {...api().getControlProps()}>
              <input data-testid="input" {...api().getInputProps()} />
              <button
                data-testid="trigger"
                {...mergeProps(api().getTriggerProps(), {
                  onClick: () => setOptions(comboboxData),
                })}
              >
                ▼
              </button>
              <button {...api().getClearTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>

          <div {...api().getPositionerProps()}>
            <div data-testid="combobox-content" {...api().getContentProps()}>
              <Show when={options().length > 0}>
                <div {...api().getListProps()}>
                  <For each={options()}>
                    {(item) => (
                      <div data-testid={item.code} {...api().getItemProps({ item })}>
                        <span {...api().getItemIndicatorProps({ item })}>✅</span>
                        <span>{item.label}</span>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
