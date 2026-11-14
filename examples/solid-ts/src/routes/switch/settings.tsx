import { normalizeProps, useMachine } from "@zag-js/solid"
import * as zagSwitch from "@zag-js/switch"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/switch.css"

function useSetting(props: () => Omit<zagSwitch.Props, "id">) {
  const id = createUniqueId()
  const service = useMachine(zagSwitch.machine, () => ({ ...props(), id }))
  return { service, api: createMemo(() => zagSwitch.connect(service, normalizeProps)) }
}

export default function Page() {
  const [lowPower, setLowPower] = createSignal(false)

  const power = useSetting(() => ({ onCheckedChange: (details) => setLowPower(details.checked) }))
  const background = useSetting(() => ({ defaultChecked: true, disabled: lowPower() }))
  const location = useSetting(() => ({ defaultChecked: true, disabled: lowPower() }))

  const rows = [
    { label: "Low power mode", testId: "switch-low-power", api: power.api },
    { label: "Background refresh", testId: "switch-background", api: background.api },
    { label: "Location services", testId: "switch-location", api: location.api },
  ]

  return (
    <>
      <main>
        <div class="switch-settings">
          <p class="hint">Turn on Low power mode to pause the other two.</p>
          <div class="rows">
            <For each={rows}>
              {(row) => (
                <label {...row.api().getRootProps()}>
                  <input {...row.api().getHiddenInputProps()} />
                  <span {...row.api().getControlProps()}>
                    <span {...row.api().getThumbProps()} />
                  </span>
                  <span {...row.api().getLabelProps()}>{row.label}</span>
                </label>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={power.service} />
      </Toolbar>
    </>
  )
}
