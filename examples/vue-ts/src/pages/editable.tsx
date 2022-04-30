import { injectGlobal } from "@emotion/css"
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { editableControls } from "../../../../shared/controls"
import { editableStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { useId } from "../hooks/use-id"

injectGlobal(editableStyle)

export default defineComponent({
  name: "Editable",
  setup() {
    const controls = useControls(editableControls)

    const [state, send] = useMachine(editable.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => editable.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main>
            <div ref={ref} {...api.rootProps}>
              <div {...api.areaProps}>
                <input data-testid="input" {...api.inputProps} />
                <span data-testid="preview" {...api.previewProps} />
              </div>
              <div {...api.controlGroupProps}>
                {!api.isEditing && (
                  <button data-testid="edit-button" {...api.editButtonProps}>
                    Edit
                  </button>
                )}
                {api.isEditing && (
                  <>
                    <button data-testid="save-button" {...api.submitButtonProps}>
                      Save
                    </button>
                    <button data-testid="cancel-button" {...api.cancelButtonProps}>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
