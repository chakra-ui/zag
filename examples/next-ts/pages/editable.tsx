import { Global } from "@emotion/react"
import * as editable from "@ui-machines/editable"
import { useMachine, useSetup } from "@ui-machines/react"
import { editableControls } from "../../../shared/controls"
import { editableStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(editable.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: "1" })

  const api = editable.connect(state, send)

  return (
    <>
      <Global styles={editableStyle} />
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
