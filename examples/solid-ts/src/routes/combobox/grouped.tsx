import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, groupedData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/combobox.css"

type Item = (typeof groupedData)[number]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = createSignal(groupedData)

  const collection = createMemo(() => combobox.collection({ items: options(), groupBy: (item) => item.type }))

  const id = createUniqueId()
  const service = useMachine(
    combobox.machine as combobox.Machine<Item>,
    controls.mergeProps<combobox.Props<Item>>(() => ({
      id,
      collection: collection(),
      onOpenChange({ open }) {
        if (!open) setOptions(groupedData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = groupedData.filter((item) => contains(item.label, inputValue))
        setOptions(filtered.length > 0 ? filtered : groupedData)
      },
    })),
  )

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select produce</label>
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
            <div {...api().getContentProps()}>
              <div {...api().getListProps()}>
                <For each={collection().group()}>
                  {([type, items]) => (
                    <div {...api().getItemGroupProps({ id: type })}>
                      <div {...api().getItemGroupLabelProps({ htmlFor: type })}>{type}</div>
                      <For each={items}>
                        {(item) => (
                          <div {...api().getItemProps({ item })}>
                            <span {...api().getItemTextProps({ item })}>{item.label}</span>
                            <span {...api().getItemIndicatorProps({ item })}>✓</span>
                          </div>
                        )}
                      </For>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
