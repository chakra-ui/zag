import styles from "../../../../../shared/src/css/editable.module.css"
import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(editableControls)

  const service = useMachine(
    editable.machine,
    controls.mergeProps<editable.Props>({
      id: createUniqueId(),
      defaultValue: "Hello World",
    }),
  )

  const api = createMemo(() => editable.connect(service, normalizeProps))

  return (
    <>
      <main class="editable">
        <div {...api().getRootProps()}>
          <div {...api().getAreaProps()} class={styles.Area}>
            <input data-testid="input" {...api().getInputProps()} class={styles.Input} />
            <span data-testid="preview" {...api().getPreviewProps()} class={styles.Preview} />
          </div>
          <div {...api().getControlProps()} class={styles.Control}>
            <Show when={!api().editing}>
              <button data-testid="edit-button" {...api().getEditTriggerProps()}>
                Edit
              </button>
            </Show>
            <Show when={api().editing}>
              <>
                <button data-testid="save-button" {...api().getSubmitTriggerProps()}>
                  Save
                </button>
                <button data-testid="cancel-button" {...api().getCancelTriggerProps()}>
                  Cancel
                </button>
              </>
            </Show>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
