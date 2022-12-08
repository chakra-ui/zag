import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { radioControls, radioData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "radio",
  setup() {
    const controls = useControls(radioControls)

    const [state, send] = useMachine(radio.machine({ id: "1", name: "fruit" }), {
      context: controls.context,
    })

    const apiRef = computed(() => radio.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="radio">
            <form>
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

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
