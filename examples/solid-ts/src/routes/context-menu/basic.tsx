import styles from "../../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    onSelect: console.log,
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main class="context-menu">
        <div {...api().getContextTriggerProps()} class={styles.ContextTrigger}>Right click here</div>
        <Portal>
          <div {...api().getPositionerProps()}>
            <ul {...api().getContentProps()} class={styles.Content}>
              <li {...api().getItemProps({ value: "edit" })} class={styles.Item}>Edit</li>
              <li {...api().getItemProps({ value: "duplicate" })} class={styles.Item}>Duplicate</li>
              <li {...api().getItemProps({ value: "delete" })} class={styles.Item}>Delete</li>
              <li {...api().getItemProps({ value: "export" })} class={styles.Item}>Export...</li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
