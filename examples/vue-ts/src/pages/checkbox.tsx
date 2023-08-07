import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Checkbox",
  setup() {
    const controls = useControls(checkboxControls)

    const [state, send] = useMachine(
      checkbox.machine({
        name: "checkbox",
        id: "v1",
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => checkbox.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="checkbox">
            <form>
              <fieldset>
                <label {...api.rootProps}>
                  <div {...api.controlProps} />
                  <span {...api.labelProps}>Input {api.isChecked ? "Checked" : "Unchecked"}</span>
                  <input {...api.hiddenInputProps} data-testid="hidden-input" />
                </label>

                <button type="button" disabled={api.isChecked} onClick={() => api.setChecked(true)}>
                  Check
                </button>
                <button type="button" disabled={!api.isChecked} onClick={() => api.setChecked(false)}>
                  Uncheck
                </button>
                <button type="reset">Reset Form</button>
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
