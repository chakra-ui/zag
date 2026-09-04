import { normalizeProps, useMachine } from "@zag-js/react"
import * as wheelPicker from "@zag-js/wheel-picker"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

const frameworks = wheelPicker.collection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
  ],
})

export default function Page() {
  const [value, setValue] = useState("react")

  const service = useMachine(wheelPicker.machine, {
    id: useId(),
    collection: frameworks,
    value,
    onValueChange(details) {
      setValue(details.value ?? "react")
    },
  })

  const api = wheelPicker.connect(service, normalizeProps)

  return (
    <>
      <main className="wheel-picker">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Framework</label>

          <div {...api.getControlProps()}>
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

        <div className="wheel-picker-actions">
          <button type="button" onClick={() => setValue("react")}>
            Select React
          </button>
          <button type="button" onClick={() => setValue("svelte")}>
            Select Svelte
          </button>
        </div>

        <output data-testid="value">Controlled value: {api.valueAsString}</output>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
