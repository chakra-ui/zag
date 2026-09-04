import { normalizeProps, useMachine } from "@zag-js/react"
import { wheelPickerControls } from "@zag-js/shared"
import * as wheelPicker from "@zag-js/wheel-picker"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

const frameworks = wheelPicker.collection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { disabled: true, label: "Angular (unavailable)", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Solid", value: "solid" },
    { label: "Preact", value: "preact" },
    { label: "Qwik", value: "qwik" },
    { label: "Lit", value: "lit" },
  ],
})

export default function Page() {
  const controls = useControls(wheelPickerControls)

  const service = useMachine(wheelPicker.machine, {
    id: useId(),
    collection: frameworks,
    defaultValue: "react",
    name: "framework",
    ...controls.context,
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

          <select {...api.getHiddenSelectProps()}>
            {frameworks.items.map((item) => (
              <option key={item.value} value={item.value} disabled={item.disabled}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <output data-testid="value">Selected: {api.valueAsString}</output>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
