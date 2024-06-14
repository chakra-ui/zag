import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { editableControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(
    editable.machine({
      id: useId(),
      value: "Hello World",
    }),
    {
      context: controls.context,
    },
  )

  const api = editable.connect(state, send, normalizeProps)

  return (
    <>
      <main className="editable">
        <div {...api.getRootProps()}>
          <div {...api.getAreaProps()}>
            <input data-testid="input" {...api.getInputProps()} />
            <span data-testid="preview" {...api.getPreviewProps()} />
          </div>
          <div {...api.getControlProps()}>
            {!api.editing && (
              <button data-testid="edit-button" {...api.getEditTriggerProps()}>
                Edit
              </button>
            )}
            {api.editing && (
              <>
                <button data-testid="save-button" {...api.getSubmitTriggerProps()}>
                  Save
                </button>
                <button data-testid="cancel-button" {...api.getCancelTriggerProps()}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
