import { useMachine, useSetup } from "@ui-machines/react"
import { editable } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"

export default function Page() {
  const controls = useControls({
    placeholder: { type: "string", defaultValue: "Type something...", label: "placeholder" },
    isPreviewFocusable: { type: "boolean", label: "is preview focusable?", defaultValue: false },
    activationMode: {
      type: "select",
      options: ["focus", "dblclick"] as const,
      label: "activation mode",
      defaultValue: "focus",
    },
  })

  const [state, send] = useMachine(editable.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: "123" })

  const { isEditing, isValueEmpty, inputProps, previewProps, cancelButtonProps, submitButtonProps, editButtonProps } =
    editable.connect(state, send)

  return (
    <div>
      <controls.ui />
      <div>
        <input ref={ref} style={{ width: "auto", background: "transparent" }} {...inputProps} />
        <span style={{ opacity: isValueEmpty ? 0.7 : 1 }} {...previewProps} />
        {!isEditing && <button {...editButtonProps}>Edit</button>}
        {isEditing && (
          <>
            <button {...submitButtonProps}>Save</button>
            <button {...cancelButtonProps}>Cancel</button>
          </>
        )}
        <StateVisualizer state={state} />
      </div>
    </div>
  )
}
