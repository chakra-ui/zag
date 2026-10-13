import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/editable.css"

export default function Page() {
  const [edit, setEdit] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(editable.machine, () => ({
    id,
    value: "Hello World",
    edit: edit(),
    onEditChange(details) {
      setEdit(details.edit)
    },
  }))

  const api = createMemo(() => editable.connect(service, normalizeProps))

  return (
    <>
      <main class="editable">
        <div {...api().getRootProps()}>
          <div {...api().getAreaProps()}>
            <input data-testid="input" {...api().getInputProps()} />
            <span data-testid="preview" {...api().getPreviewProps()} />
          </div>
          <div {...api().getControlProps()}>
            <Show when={!api().editing}>
              <button data-testid="edit-button" {...api().getEditTriggerProps()}>
                Edit
              </button>
            </Show>
            <Show when={api().editing}>
              <button data-testid="save-button" {...api().getSubmitTriggerProps()}>
                Save
              </button>
              <button data-testid="cancel-button" {...api().getCancelTriggerProps()}>
                Cancel
              </button>
            </Show>
          </div>
        </div>
      </main>
    </>
  )
}
