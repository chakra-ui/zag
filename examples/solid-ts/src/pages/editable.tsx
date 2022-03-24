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

  const api = createMemo(() => Editable.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="root" {...api().rootProps}>
        <div className="editable__area" {...api().areaProps}>
          <input className="editable__input" data-testid="input" ref={ref} {...api().inputProps} />
          <span className="editable__preview" data-testid="preview" {...api().previewProps} />
        </div>
        <div>
          {!api().isEditing && (
            <button className="editable__edit" data-testid="edit-button" {...api().editButtonProps}>
              Edit
            </button>
          )}
          {api().isEditing && (
            <div className="editable__controls">
              <button data-testid="save-button" {...api().submitButtonProps}>
                Save
              </button>
              <button data-testid="cancel-button" {...api().cancelButtonProps}>
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
