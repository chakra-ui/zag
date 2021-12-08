import * as Editable from "@ui-machines/editable"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"

export default function Page() {
  const controls = useControls({
    placeholder: { type: "string", defaultValue: "Type something...", label: "placeholder" },
    submitMode: {
      type: "select",
      label: "submit mode?",
      options: ["enter", "blur", "both", "none"] as const,
      defaultValue: "both",
    },
    activationMode: {
      type: "select",
      options: ["focus", "dblclick", "none"] as const,
      label: "activation mode",
      defaultValue: "focus",
    },
  })

  const [state, send] = useMachine(Editable.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: "123" })

  const editable = Editable.connect(state, send)

  return (
    <div>
      <controls.ui />
      <div className="root">
        <input
          data-testid="input"
          ref={ref}
          style={{ width: "auto", background: "transparent" }}
          {...editable.inputProps}
        />
        <span data-testid="preview" style={{ opacity: editable.isValueEmpty ? 0.7 : 1 }} {...editable.previewProps} />
        {!editable.isEditing && (
          <button data-testid="edit-button" {...editable.editButtonProps}>
            Edit
          </button>
        )}
        {editable.isEditing && (
          <>
            <button data-testid="save-button" {...editable.submitButtonProps}>
              Save
            </button>
            <button data-testid="cancel-button" {...editable.cancelButtonProps}>
              Cancel
            </button>
          </>
        )}
        <StateVisualizer state={state} />
      </div>
    </div>
  )
}
