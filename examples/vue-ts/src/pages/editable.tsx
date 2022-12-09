import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Editable",
  setup() {
    const controls = useControls(editableControls)

    const [state, send] = useMachine(editable.machine({ id: "editable" }), {
      context: controls.context,
    })

    const apiRef = computed(() => editable.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="editable">
            <div {...api.rootProps}>
              <div {...api.areaProps}>
                <input data-testid="input" {...api.inputProps} />
                <span data-testid="preview" {...api.previewProps} />
              </div>
              <div {...api.controlProps}>
                {!api.isEditing && (
                  <button data-testid="edit-button" {...api.editTriggerProps}>
                    Edit
                  </button>
                )}
                {api.isEditing && (
                  <>
                    <button data-testid="save-button" {...api.submitTriggerProps}>
                      Save
                    </button>
                    <button data-testid="cancel-button" {...api.cancelTriggerProps}>
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
