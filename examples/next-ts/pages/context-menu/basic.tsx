import styles from "../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: console.log,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <main className="context-menu">
        <div {...api.getContextTriggerProps()} className={styles.ContextTrigger}>Right Click here</div>
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul {...api.getContentProps()} className={styles.Content}>
              <li {...api.getItemProps({ value: "edit" })} className={styles.Item}>Edit</li>
              <li {...api.getItemProps({ value: "duplicate" })} className={styles.Item}>Duplicate</li>
              <li {...api.getItemProps({ value: "delete" })} className={styles.Item}>Delete</li>
              <li {...api.getItemProps({ value: "export" })} className={styles.Item}>Export...</li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
