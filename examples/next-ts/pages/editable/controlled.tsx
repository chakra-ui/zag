import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [edit, setEdit] = useState(false)

  const service = useMachine(editable.machine, {
    id: useId(),
    value: "Hello World",
    edit,
    onEditChange(details) {
      setEdit(details.edit)
    },
  })

  const api = editable.connect(service, normalizeProps)

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
    </>
  )
}
