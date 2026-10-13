import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
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
  const controls = useControls(comboboxControls)

  const [options, setOptions] = createSignal(comboboxData)
  const [submitCount, setSubmitCount] = createSignal(0)
  const [lastSubmit, setLastSubmit] = createSignal<string | null>(null)

  const collection = createMemo(() =>
    combobox.collection<Item>({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(
    combobox.machine as combobox.Machine<Item>,
    controls.mergeProps<combobox.Props<Item>>(() => ({
      id,
      collection: collection(),
      name: "country",
      onOpenChange() {
        setOptions(comboboxData)
      },
      onInputValueChange({ inputValue }) {
        const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
        setOptions(filtered)
      },
    })),
  )

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const data = new FormData(e.currentTarget)
            const value = String(data.get("country") ?? "")
            setSubmitCount((c) => c + 1)
            setLastSubmit(value)
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Select country</label>
            <div {...api().getControlProps()}>
              <input data-testid="input" {...api().getInputProps()} />
              <button data-testid="trigger" type="button" {...api().getTriggerProps()}>
                ▼
              </button>
              <button type="button" {...api().getClearTriggerProps()}>
                <XIcon />
              </button>
            </div>
          </div>
          <div {...api().getPositionerProps()}>
            <Show when={options().length > 0}>
              <ul data-testid="combobox-content" {...api().getContentProps()}>
                <For each={options()}>
                  {(item) => (
                    <li data-testid={item.code} {...api().getItemProps({ item })}>
                      <span {...api().getItemIndicatorProps({ item })}>✅</span>
                      <span>{item.label}</span>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </div>

          <div style={{ "margin-top": "16px" }}>
            <button type="submit">Submit</button>
          </div>
        </form>

        <section style={{ "margin-top": "16px" }}>
          <strong>submit count:</strong> <span data-testid="submit-count">{submitCount()}</span>
          <br />
          <strong>last submitted value:</strong> <span data-testid="last-submit">{lastSubmit() ?? "—"}</span>
        </section>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
