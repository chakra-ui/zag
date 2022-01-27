import { Global } from "@emotion/react"
import * as Editable from "@ui-machines/editable"
import { useMachine, useSetup } from "@ui-machines/react"
import { editableControls } from "../../../shared/controls"
import { editableStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(Editable.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: "1" })

  const { inputProps, isEditing, previewProps, editButtonProps, submitButtonProps, cancelButtonProps } =
    Editable.connect(state, send)

  return (
    <>
      <Global styles={editableStyle} />
      <controls.ui />

      <div className="root">
        <div className="editable__area">
          <input className="editable__input" data-testid="input" ref={ref} {...inputProps} />
          <span className="editable__preview" data-testid="preview" {...previewProps} />
        </div>
        {!isEditing && (
          <button className="editable__edit" data-testid="edit-button" {...editButtonProps}>
            Edit
          </button>
        )}
        {isEditing && (
          <div className="editable__controls">
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
