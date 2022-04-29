import { Global } from "@emotion/react"
import * as editable from "@zag-js/editable"
import { useMachine, useSetup } from "@zag-js/react"
import { useId } from "react"
import { editableControls } from "../../../shared/controls"
import { editableStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(editable.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: useId() })

  const api = editable.connect(state, send)

  return (
    <>
      <Global styles={editableStyle} />

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
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
