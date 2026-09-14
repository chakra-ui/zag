import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const frameworks = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid", "Preact"].map((label) => ({
    label,
    value: label.toLowerCase(),
  })),
})

export default function Page() {
  const service = useMachine(wheelPicker.machine, {
    id: useId(),
    collection: frameworks,
    defaultValue: "react",
    name: "framework",
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
          <select {...api.getHiddenSelectProps()}>
            {frameworks.items.map((item) => (
              <option value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <output data-testid="value">Selected: {api.valueAsString}</output>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
