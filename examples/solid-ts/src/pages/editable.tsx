import { injectGlobal } from "@emotion/css"
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { editableControls } from "../../../../shared/controls"
import { editableStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(editableStyle)

export default function Page() {
  const controls = useControls(editableControls)

  const [state, send] = useMachine(
    editable.machine({
      placeholder: "Edit me...",
    }),
    { context: controls.context },
  )

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => editable.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <main>
        <div {...api().rootProps}>
          <div {...api().areaProps}>
            <input data-testid="input" ref={ref} {...api().inputProps} />
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
