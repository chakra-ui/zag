import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { editableControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(
    editable.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = editable.connect(state, send, normalizeProps)

  return (
    <>
      <main className="editable">
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
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
