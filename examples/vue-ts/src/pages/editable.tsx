import { injectGlobal } from "@emotion/css"
import * as Editable from "@ui-machines/editable"
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

    const [state, send] = useMachine(Editable.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const editableRef = computed(() => Editable.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const { isEditing, inputProps, previewProps, cancelButtonProps, submitButtonProps, editButtonProps } =
        editableRef.value

      return (
        <>
          <controls.ui />

          <div class="root">
            <div class="editable__area">
              <input class="editable__input" data-testid="input" ref={ref} {...inputProps} />
              <span class="editable__preview" data-testid="preview" {...previewProps} />
            </div>
            {!isEditing && (
              <button class="editable__edit" data-testid="edit-button" {...editButtonProps}>
                Edit
              </button>
            )}
            {isEditing && (
              <div class="editable__controls">
                <button data-testid="save-button" {...submitButtonProps}>
                  Save
                </button>
                <button data-testid="cancel-button" {...cancelButtonProps}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
