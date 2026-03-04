import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/editable.module.css"

interface EditableProps extends Omit<editable.Props, "id"> {}

export function Editable(props: EditableProps) {
  const service = useMachine(editable.machine, {
    id: useId(),
    ...props,
  })

  const api = editable.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <div className={styles.Area} {...api.getAreaProps()}>
        <input className={styles.Input} {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>

      <div>
        {!api.editing && (
          <button className={styles.EditTrigger} {...api.getEditTriggerProps()}>
            Edit
          </button>
        )}
        {api.editing && (
          <div className={styles.SubmitActions}>
            <button
              className={styles.SubmitTrigger}
              {...api.getSubmitTriggerProps()}
            >
              Save
            </button>
            <button
              className={styles.CancelTrigger}
              {...api.getCancelTriggerProps()}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
