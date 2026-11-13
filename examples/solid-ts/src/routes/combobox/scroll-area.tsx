import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as scrollArea from "@zag-js/scroll-area"
import { comboboxData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

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

  // The content doubles as the scroll area viewport, so both machines share one id
  const contentId = createUniqueId()

  const service = useMachine(combobox.machine, () => ({
    id: createUniqueId(),
    ids: { content: contentId },
    collection: collection(),
    defaultValue: ["TG"],
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  const scrollAreaService = useMachine(scrollArea.machine, {
    id: createUniqueId(),
    ids: { viewport: contentId },
  })

  const scrollAreaApi = createMemo(() => scrollArea.connect(scrollAreaService, normalizeProps))

  const rootProps = mergeProps(() => scrollAreaApi().getRootProps(), { style: { width: "auto", height: "auto" } })

  const contentProps = mergeProps(
    () => scrollAreaApi().getViewportProps(),
    () => api().getContentProps(),
    { style: { "scrollbar-width": "none" } },
  )

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select country</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} />
            <button {...api().getTriggerProps()}>▼</button>
          </div>
        </div>
        <div {...api().getPositionerProps()}>
          <div {...rootProps}>
            <ul {...contentProps}>
              <Index each={options()}>
                {(item) => (
                  <li {...api().getItemProps({ item: item() })}>
                    <span {...api().getItemIndicatorProps({ item: item() })}>✅</span>
                    <span>{item().label}</span>
                  </li>
                )}
              </Index>
            </ul>
            <div {...scrollAreaApi().getScrollbarProps({ orientation: "vertical" })}>
              <div {...scrollAreaApi().getThumbProps({ orientation: "vertical" })} />
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
