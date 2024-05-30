import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { radioControls, radioData } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(radioControls)

  const [state, send] = useMachine(
    radio.machine({
      id: useId(),
      name: "fruit",
    }),
    {
      context: controls.context,
    },
  )

  const api = radio.connect(state, send, normalizeProps)

  return (
    <>
      <main className="radio">
        <form
          onChange={(e) => {
            const result = serialize(e.currentTarget, { hash: true })
            console.log(result)
          }}
        >
          <fieldset disabled={false}>
            <div {...api.getRootProps()}>
              <h3 {...api.getLabelProps()}>Fruits</h3>
              <div {...api.getIndicatorProps()} />
              {radioData.map((opt) => (
                <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                  <div data-testid={`control-${opt.id}`} {...api.getItemControlProps({ value: opt.id })} />
                  <span data-testid={`label-${opt.id}`} {...api.getItemTextProps({ value: opt.id })}>
                    {opt.label}
                  </span>
                  <input data-testid={`input-${opt.id}`} {...api.getItemHiddenInputProps({ value: opt.id })} />
                </label>
              ))}
            </div>

            {/*  */}
            <button type="reset">Reset</button>
            <button type="button" onClick={() => api.clearValue()}>
              Clear
            </button>
            <button type="button" onClick={() => api.setValue("mango")}>
              Set to Mangoes
            </button>
            <button type="button" onClick={() => api.focus()}>
              Focus
            </button>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
