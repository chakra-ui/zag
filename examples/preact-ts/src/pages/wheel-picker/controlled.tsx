import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
const frameworks = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid"].map((label) => ({ label, value: label.toLowerCase() })),
})
export default function Page() {
  const [value, setValue] = useState("react")
  const service = useMachine(wheelPicker.machine, {
    id: useId(),
    collection: frameworks,
    value,
    onValueChange: (details) => setValue(details.value ?? "react"),
  })
  const api = wheelPicker.connect(service, normalizeProps)
  return (
    <>
      <main className="wheel-picker">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Framework</label>
          <div {...api.getControlProps()}>
            <div {...api.getViewportProps()}>
              <ul {...api.getItemGroupProps()}>
                {api.items.map(({ item, index, key }) => (
                  <li key={key} {...api.getItemProps({ item, index })}>
                    {item.label}
                  </li>
                ))}
              </ul>
              <div {...api.getHighlightProps()}>
                <ul {...api.getHighlightItemGroupProps()}>
                  {api.highlightItems.map(({ item, index, key }) => (
                    <li key={key} {...api.getHighlightItemProps({ item, index })}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="wheel-picker-actions">
          <button onClick={() => setValue("react")}>Select React</button>
          <button onClick={() => setValue("svelte")}>Select Svelte</button>
        </div>
        <output data-testid="value">Controlled value: {api.valueAsString}</output>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
