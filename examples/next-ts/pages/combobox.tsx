import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(comboboxControls)

  const [options, setOptions] = useState(comboboxData)

  const collection = combobox.collection({
    items: options,
    getItemKey: (item) => item.code,
    getItemLabel: (item) => item.label,
  })

  const [state, send] = useMachine(
    combobox.machine({
      id: useId(),
      collection,
      onOpenChange(open) {
        if (!open) return
        setOptions(comboboxData)
      },
      onInputChange({ value }) {
        const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
        setOptions(filtered.length > 0 ? filtered : comboboxData)
      },
    }),
    {
      context: {
        ...controls.context,
        collection,
      },
    },
  )

  const api = combobox.connect(state, send, normalizeProps)

  return (
    <>
      <main className="combobox">
        <div>
          <button onClick={() => api.setValue(["TG"])}>Set to Togo</button>
          <button data-testid="clear-value-button" onClick={() => api.clearValue()}>
            Clear Value
          </button>
          <br />
          <div {...api.rootProps}>
            <label {...api.labelProps}>Select country</label>
            <div {...api.controlProps}>
              <input data-testid="input" {...api.inputProps} />
              <button data-testid="trigger" {...api.triggerProps}>
                ▼
              </button>
            </div>
          </div>
          <div {...api.positionerProps}>
            {options.length > 0 && (
              <ul data-testid="combobox-content" {...api.contentProps}>
                {options.map((item, index) => (
                  <li data-testid={item.code} key={`${item.code}:${index}`} {...api.getItemProps({ item })}>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
