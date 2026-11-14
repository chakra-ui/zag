import { normalizeProps, useMachine } from "@zag-js/preact"
import * as zagSwitch from "@zag-js/switch"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/switch.css"

function useSetting(props: Omit<zagSwitch.Props, "id">) {
  const service = useMachine(zagSwitch.machine, { ...props, id: useId() })
  return { service, api: zagSwitch.connect(service, normalizeProps) }
}

export default function Page() {
  const [lowPower, setLowPower] = useState(false)

  const power = useSetting({ onCheckedChange: (details) => setLowPower(details.checked) })
  const background = useSetting({ defaultChecked: true, disabled: lowPower })
  const location = useSetting({ defaultChecked: true, disabled: lowPower })

  const rows = [
    { label: "Low power mode", testId: "switch-low-power", api: power.api },
    { label: "Background refresh", testId: "switch-background", api: background.api },
    { label: "Location services", testId: "switch-location", api: location.api },
  ]

  return (
    <>
      <main>
        <div className="switch-settings">
          <p className="hint">Turn on Low power mode to pause the other two.</p>
          <div className="rows">
            {rows.map(({ label, testId, api }) => (
              <label key={testId} {...api.getRootProps()}>
                <input {...api.getHiddenInputProps()} />
                <span {...api.getControlProps()}>
                  <span {...api.getThumbProps()} />
                </span>
                <span {...api.getLabelProps()}>{label}</span>
              </label>
            ))}
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={power.service} />
      </Toolbar>
    </>
  )
}
