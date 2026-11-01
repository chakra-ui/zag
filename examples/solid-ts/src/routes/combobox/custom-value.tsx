import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = createSignal(comboboxData)

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
    name: "country",
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered)
    },
    allowCustomValue: true,
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const data = new FormData(e.currentTarget)
          console.log(data.get("country"))
        }}
      >
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
            <Show when={options().length > 0}>
              <div {...api().getListProps()}>
                <Index each={options()}>
                  {(item) => (
                    <div data-testid={item().code} {...api().getItemProps({ item: item() })}>
                      <span {...api().getItemIndicatorProps({ item: item() })}>✅</span>
                      <span>{item().label}</span>
                    </div>
                  )}
                </Index>
              </div>
            </Show>
          </div>
        </div>
      </form>
    </main>
  )
}
