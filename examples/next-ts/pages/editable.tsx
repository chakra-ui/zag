import * as Editable from "@ui-machines/editable"
import { useMachine, useSetup } from "@ui-machines/react"
import { editableControls } from "../../../shared/controls"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(Editable.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: "1" })

  const { inputProps, isEditing, previewProps, editButtonProps, isValueEmpty, submitButtonProps, cancelButtonProps } =
    Editable.connect(state, send)

  return (
    <div>
      <controls.ui />
      <div className="root">
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
