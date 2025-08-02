import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { radioControls, segmentControlData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const service = useMachine(radio.machine, {
    id: useId(),
    name: "fruit",
    orientation: "horizontal",
    defaultValue: "orange",
    ...controls.context,
  })

  const api = radio.connect(service, normalizeProps)

  return (
    <>
      <main className="segmented-control">
        <div {...api.getRootProps()}>
          <div {...api.getIndicatorProps()} />
          {segmentControlData.map((opt) => (
            <label
              key={opt.id}
              data-testid={`radio-${opt.id}`}
              {...api.getItemProps({ value: opt.id, disabled: opt.disabled })}
            >
              <span
                data-testid={`label-${opt.id}`}
                {...api.getItemTextProps({ value: opt.id, disabled: opt.disabled })}
              >
                {opt.label}
              </span>
              <input
                data-testid={`input-${opt.id}`}
                {...api.getItemHiddenInputProps({ value: opt.id, disabled: opt.disabled })}
              />
            </label>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "row" }}>
          <button onClick={api.clearValue}>Reset</button>
          <button onClick={() => api.clearValue()}>Clear</button>
          <button onClick={() => api.setValue("orange")}>Set to Oranges</button>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
