import * as Editable from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    Editable.machine.withContext({
      placeholder: "Edit me...",
      isPreviewFocusable: true,
    }),
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
