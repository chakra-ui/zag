import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { radioControls, radioData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const [state, send] = useMachine(radio.machine({ id: useId(), name: "fruit" }), {
    context: controls.context,
  })

  const api = radio.connect(state, send, normalizeProps)

  return (
    <>
      <main className="segmented-control">
        <div {...api.rootProps}>
          <div {...api.indicatorProps} />
          {radioData.map((opt) => (
            <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
              <span data-testid={`label-${opt.id}`} {...api.getItemTextProps({ value: opt.id })}>
                {opt.label}
              </span>
              <input data-testid={`input-${opt.id}`} {...api.getItemHiddenInputProps({ value: opt.id })} />
            </label>
          ))}
        </div>
        <button onClick={api.clearValue}>reset</button>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
