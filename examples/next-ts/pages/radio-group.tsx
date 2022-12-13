import * as radio from "@zag-js/radio-group"
import { useMachine, normalizeProps } from "@zag-js/react"
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
      <main className="radio">
        <form
          onChange={(e) => {
            const form = new FormData(e.currentTarget)
            console.log(form.get("fruit"))
          }}
        >
          <fieldset disabled={false}>
            <div {...api.rootProps}>
              <h3 {...api.labelProps}>Fruits</h3>
              {radioData.map((opt) => (
                <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getRadioProps({ value: opt.id })}>
                  <span data-testid={`label-${opt.id}`} {...api.getRadioLabelProps({ value: opt.id })}>
                    {opt.label}
                  </span>
                  <input data-testid={`input-${opt.id}`} {...api.getRadioInputProps({ value: opt.id })} />
                  <div data-testid={`control-${opt.id}`} {...api.getRadioControlProps({ value: opt.id })} />
                </label>
              ))}
            </div>

            {/*  */}
            <button type="reset">Reset</button>
            <button type="button" onClick={() => api.setValue("mango")}>
              Set to Mangoes
            </button>
            <button type="button" onClick={() => api.focus()}>
              Focus
            </button>
            <button type="button" onClick={() => api.blur()}>
              Blur
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
