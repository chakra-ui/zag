import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { radioControls, radioData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

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
            <form
              onChange={(e) => {
                const result = serialize(e.currentTarget as HTMLFormElement, { hash: true })
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
  },
})
