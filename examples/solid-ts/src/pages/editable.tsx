import { injectGlobal } from "@emotion/css"
import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"
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

  const editable = createMemo(() => Editable.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="root">
        <div className="editable__area">
          <input className="editable__input" ref={ref} {...editable().inputProps} />
          <span className="editable__preview" {...editable().previewProps} />
        </div>
        {!editable().isEditing && (
          <button className="editable__edit" {...editable().editButtonProps}>
            Edit
          </button>
        )}
        {editable().isEditing && (
          <div className="editable__controls">
            <button {...editable().submitButtonProps}>Save</button>
            <button {...editable().cancelButtonProps}>Cancel</button>
          </div>
        )}
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
