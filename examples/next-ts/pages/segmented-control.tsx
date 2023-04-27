import * as radio from "@zag-js/radio-group"
import { useMachine, normalizeProps } from "@zag-js/react"
import { radioControls, radioData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const [state, send] = useMachine(radio.machine({ id: useId(), name: "fruit" }), {
    context: controls.context,
  })

  const api = radio.connect(state, send, normalizeProps)

  const [state2, send2] = useMachine(radio.machine({ id: useId(), name: "fruit", orientation: "vertical" }), {
    context: controls.context,
  })

  const api2 = radio.connect(state2, send2, normalizeProps)

  const [bigger, setBigger] = useState(false)

  return (
    <>
      <main className="radio segmented-control">
        <div {...api.rootProps}>
          <div {...api.indicatorProps} />
          {radioData.map((opt) => (
            <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getRadioProps({ value: opt.id })}>
              <span data-testid={`label-${opt.id}`} {...api.getRadioLabelProps({ value: opt.id })}>
                {opt.label}
              </span>
              <input data-testid={`input-${opt.id}`} {...api.getRadioInputProps({ value: opt.id })} />
            </label>
          ))}
        </div>

        <hr />

        <div {...api2.rootProps} style={{ flexDirection: "column", alignItems: "start" }}>
          <div {...api2.indicatorProps} />
          {radioData.map((opt) => (
            <label key={opt.id} data-testid={`radio-${opt.id}`} {...api2.getRadioProps({ value: opt.id })}>
              <span data-testid={`label-${opt.id}`} {...api2.getRadioLabelProps({ value: opt.id })}>
                {opt.label} {bigger ? " - 3 new in stock" : ""}
              </span>
              <input data-testid={`input-${opt.id}`} {...api2.getRadioInputProps({ value: opt.id })} />
            </label>
          ))}
        </div>

        <hr />
        <button onClick={() => setBigger((b) => !b)}>Change Size</button>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
