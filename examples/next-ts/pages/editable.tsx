import { useMachine } from "@ui-machines/react"
import { connectEditableMachine, editableMachine } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const Page = () => {
  const [state, send] = useMachine(
    editableMachine.withContext({
      placeholder: "Edit me...",
      isPreviewFocusable: true,
    }),
  )

  const ref = useMount<HTMLInputElement>(send)

  const {
    isEditing,
    isValueEmpty,
    inputProps,
    previewProps,
    cancelButtonProps,
    submitButtonProps,
    editButtonProps,
  } = connectEditableMachine(state, send)

  return (
    <div>
      <input
        ref={ref}
        style={{ width: "auto", background: "transparent" }}
        {...inputProps}
      />
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
  )
}

export default Page
