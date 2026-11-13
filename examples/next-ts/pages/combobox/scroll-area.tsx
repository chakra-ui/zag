import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { comboboxData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = useState(comboboxData)

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  // The content doubles as the scroll area viewport, so both machines share one id
  const contentId = useId()

  const service = useMachine(combobox.machine, {
    id: useId(),
    ids: { content: contentId },
    collection,
    defaultValue: ["TG"],
    onOpenChange() {
      setOptions(comboboxData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = comboboxData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : comboboxData)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  const scrollAreaService = useMachine(scrollArea.machine, {
    id: useId(),
    ids: { viewport: contentId },
  })

  const scrollAreaApi = scrollArea.connect(scrollAreaService, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select country</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
            <button {...api.getTriggerProps()}>▼</button>
          </div>
        </div>
        <div {...api.getPositionerProps()}>
          <div {...mergeProps(scrollAreaApi.getRootProps(), { style: { width: "auto", height: "auto" } })}>
            <ul
              {...mergeProps(scrollAreaApi.getViewportProps(), api.getContentProps(), {
                style: { scrollbarWidth: "none" },
              })}
            >
              {options.map((item) => (
                <li key={item.code} {...api.getItemProps({ item })}>
                  <span {...api.getItemIndicatorProps({ item })}>✅</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <div {...scrollAreaApi.getScrollbarProps({ orientation: "vertical" })}>
              <div {...scrollAreaApi.getThumbProps({ orientation: "vertical" })} />
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
