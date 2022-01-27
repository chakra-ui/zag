import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { editableControls } from "../../../../shared/controls"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

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
    <div>
      <input ref={ref} style={{ width: "auto", background: "transparent" }} {...editable().inputProps} />
      <span style={{ opacity: editable().isValueEmpty ? 0.7 : 1 }} {...editable().previewProps} />
      {!editable().isEditing && <button {...editable().editButtonProps}>Edit</button>}
      {editable().isEditing && (
        <>
          <button {...editable().submitButtonProps}>Save</button>
          <button {...editable().cancelButtonProps}>Cancel</button>
        </>
      )}

      <StateVisualizer state={state} />
    </div>
  )
}
