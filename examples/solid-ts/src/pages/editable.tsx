import { injectGlobal } from "@emotion/css"
import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { editableControls } from "../../../../shared/controls"
import { editableStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(editableStyle)

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(
    Editable.machine.withContext({
      placeholder: "Edit me...",
    }),
    { context: controls.context },
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const editable = createMemo(() => Editable.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="root">
        <div className="editable__area">
          <input className="editable__input" data-testid="input" ref={ref} {...editable().inputProps} />
          <span className="editable__preview" data-testid="preview" {...editable().previewProps} />
        </div>
        {!editable().isEditing && (
          <button className="editable__edit" data-testid="edit-button" {...editable().editButtonProps}>
            Edit
          </button>
        )}
        {editable().isEditing && (
          <div className="editable__controls">
            <button data-testid="save-button" {...editable().submitButtonProps}>
              Save
            </button>
            <button data-testid="cancel-button" {...editable().cancelButtonProps}>
              Cancel
            </button>
          </div>
        )}
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
