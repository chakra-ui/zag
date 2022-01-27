import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { editableControls } from "../../../../shared/controls"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Editable",
  setup() {
    const controls = useControls(editableControls)

    const [state, send] = useMachine(Editable.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const editableRef = computed(() => Editable.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const {
        isEditing,
        isValueEmpty,
        inputProps,
        previewProps,
        cancelButtonProps,
        submitButtonProps,
        editButtonProps,
      } = editableRef.value

      return (
        <div>
          <controls.ui />
          <div class="root">
            <input data-testid="input" ref={ref} style={{ width: "auto", background: "transparent" }} {...inputProps} />
            <span data-testid="preview" style={{ opacity: isValueEmpty ? 0.7 : 1 }} {...previewProps} />
            {!isEditing && (
              <button data-testid="edit-button" {...editButtonProps}>
                Edit
              </button>
            )}
            {isEditing && (
              <>
                <button data-testid="save-button" {...submitButtonProps}>
                  Save
                </button>
                <button data-testid="cancel-button" {...cancelButtonProps}>
                  Cancel
                </button>
              </>
            )}

            <StateVisualizer state={state} />
          </div>
        </div>
      )
    }
  },
})
