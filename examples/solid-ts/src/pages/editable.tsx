import { editable } from "@ui-machines/editable"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"
import { createMemo } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    editable.machine.withContext({
      placeholder: "Edit me...",
      isPreviewFocusable: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => editable.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div>
      <input ref={ref} style={{ width: "auto", background: "transparent" }} {...machineState().inputProps} />
      <span style={{ opacity: machineState().isValueEmpty ? 0.7 : 1 }} {...machineState().previewProps} />
      {!machineState().isEditing && <button {...machineState().editButtonProps}>Edit</button>}
      {machineState().isEditing && (
        <>
          <button {...machineState().submitButtonProps}>Save</button>
          <button {...machineState().cancelButtonProps}>Cancel</button>
        </>
      )}

      <StateVisualizer state={state} />
    </div>
  )
}
