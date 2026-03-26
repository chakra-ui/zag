import styles from "../../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { menuControls } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)
  const service = useMachine(menu.machine, { id: createUniqueId() })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div>
          <button {...api().getTriggerProps()}>
            Actions <span {...api().getIndicatorProps()}>▾</span>
          </button>

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
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
