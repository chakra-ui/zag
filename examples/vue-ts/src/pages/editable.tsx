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
      const api = editableRef.value

      return (
        <>
          <controls.ui />

          <div class="root" {...api.rootProps}>
            <div class="editable__area" {...api.areaProps}>
              <input class="editable__input" data-testid="input" ref={ref} {...api.inputProps} />
              <span class="editable__preview" data-testid="preview" {...api.previewProps} />
            </div>
            <div>
              {!api.isEditing && (
                <button class="editable__edit" data-testid="edit-button" {...api.editButtonProps}>
                  Edit
                </button>
              )}
              {api.isEditing && (
                <div class="editable__controls">
                  <button data-testid="save-button" {...api.submitButtonProps}>
                    Save
                  </button>
                  <button data-testid="cancel-button" {...api.cancelButtonProps}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
