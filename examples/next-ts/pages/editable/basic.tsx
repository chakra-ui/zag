import styles from "../../../../shared/src/css/editable.module.css"
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { editableControls } from "@zag-js/shared"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const service = useMachine(editable.machine, {
    id: useId(),
    defaultValue: "Hello World",
    ...controls.context,
  })

  const api = editable.connect(service, normalizeProps)

  return (
    <>
      <main className="editable">
        <div {...api.getRootProps()}>
          <div {...api.getAreaProps()} className={styles.Area}>
            <input data-testid="input" {...api.getInputProps()} className={styles.Input} />
            <span data-testid="preview" {...api.getPreviewProps()} className={styles.Preview} />
          </div>
          <div {...api.getControlProps()} className={styles.Control}>
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
