import { injectGlobal } from "@emotion/css"
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine, useSetup, PropTypes, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { checkboxControls } from "../../../../shared/controls"
import { checkboxStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { useId } from "../hooks/use-id"

injectGlobal(checkboxStyle)

export default defineComponent({
  name: "Checkbox",
  setup() {
    const controls = useControls(checkboxControls)

    const [state, send] = useMachine(checkbox.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => checkbox.connect<PropTypes>(state.value, send, normalizeProps))

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
          <main>
            <form>
              <fieldset>
                <label ref={ref} {...api.rootProps}>
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
