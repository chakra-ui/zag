import { normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import { useId, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(selectControls)

  const [state, send] = useMachine(
    select.machine({
      id: useId(),
      data: selectData,
    }),
    {
      context: controls.context,
    },
  )

  const api = select.connect(state, send, normalizeProps)
  const ref = useRef(null)

  return (
    <>
      <main className="select">
        {/* control */}
        <div className="control">
          <label {...api.labelProps}>Label</label>
          <button {...api.triggerProps}>
            <span>{state.context.rendered}</span>
          </button>
        </div>

        {/* Hidden select */}
        <select ref={ref} {...api.selectProps}>
          {selectData.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* UI select */}
        <div {...api.positionerProps}>
          <ul {...api.listboxProps}>
            {selectData.map(({ label, value }) => (
              <li key={value} {...api.getOptionProps({ label, value })}>
                <span>{label}</span>
                {value === api.selectedOption?.value && "✓"}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["data"]} />
      </Toolbar>
    </>
  )
}
