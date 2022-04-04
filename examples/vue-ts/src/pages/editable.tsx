import { injectGlobal } from "@emotion/css"
import * as editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { editableControls } from "../../../../shared/controls"
import { editableStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(editableStyle)

export default defineComponent({
  name: "Editable",
  setup() {
    const controls = useControls(editableControls)

    const [state, send] = useMachine(editable.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => editable.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />

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

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
