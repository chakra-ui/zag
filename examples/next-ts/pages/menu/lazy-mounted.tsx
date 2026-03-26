import styles from "../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(menuControls)
  const service = useMachine(menu.machine, {
    id: useId(),
    onSelect: console.log,
    ...controls.context,
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div>
          <button {...api.getTriggerProps()}>
            Actions <span {...api.getIndicatorProps()}>▾</span>
          </button>
          {api.open && (
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
          )}
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
