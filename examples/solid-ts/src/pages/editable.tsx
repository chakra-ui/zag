import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { editableControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(
    editable.machine({
      id: createUniqueId(),
      placeholder: "Edit me...",
    }),
    { context: controls.context },
  )

  const api = createMemo(() => editable.connect(state, send, normalizeProps))

  return (
    <>
      <main class="editable">
        <div {...api().rootProps}>
          <div {...api().areaProps}>
            <input data-testid="input" {...api().inputProps} />
            <span data-testid="preview" {...api().previewProps} />
          </div>
          <div {...api().controlGroupProps}>
            {!api().isEditing && (
              <button data-testid="edit-button" {...api().editButtonProps}>
                Edit
              </button>
            )}
            {api().isEditing && (
              <>
                <button data-testid="save-button" {...api().submitButtonProps}>
                  Save
                </button>
                <button data-testid="cancel-button" {...api().cancelButtonProps}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
