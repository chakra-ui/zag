import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Checkbox",
  setup() {
    const controls = useControls(checkboxControls)

    const [state, send] = useMachine(checkbox.machine({ id: "checkbox" }), {
      context: controls.context,
    })

    const apiRef = computed(() => checkbox.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      const inputProps = mergeProps(api.inputProps, {
        onChange() {
          if (api.isIndeterminate && !api.isReadOnly) {
            api.setIndeterminate(false)
            api.setChecked(true)
          }
        },
      })

      return (
        <>
          <main class="checkbox">
            <form>
              <fieldset>
                <label {...api.rootProps}>
                  <span {...api.labelProps}>Input {api.isChecked ? "Checked" : "Unchecked"}</span>
                  <input {...inputProps} />
                  <div {...api.controlProps} />
                </label>

                <button type="button" disabled={api.isChecked} onClick={() => api.setChecked(true)}>
                  Check
                </button>
                <button type="button" disabled={!api.isChecked} onClick={() => api.setChecked(false)}>
                  UnCheck
                </button>
                <button type="reset">Reset Form</button>
              </fieldset>
            </form>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
