import styles from "../../../../shared/src/css/select.module.css"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const controls = useControls(selectControls)

  const service = useMachine(select.machine as select.Machine<Item>, {
    collection: select.collection({ items: selectData }),
    id: useId(),
    name: "country",
    onHighlightChange(details) {
      console.log("onHighlightChange", details)
    },
    onValueChange(details) {
      console.log("onChange", details)
    },
    onOpenChange(details) {
      console.log("onOpenChange", details)
    },
    ...controls.context,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Label</label>
          {/* control */}
          <div {...api.getControlProps()} className={styles.Control}>
            <button {...api.getTriggerProps()} className={styles.Trigger}>
              <span>{api.valueAsString || "Select option"}</span>
              <span {...api.getIndicatorProps()}>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>X</button>
          </div>

          <form
            onChange={(e) => {
              const formData = serialize(e.currentTarget, { hash: true })
              console.log(formData)
            }}
          >
            {/* Hidden select */}
            <select {...api.getHiddenSelectProps()}>
              {api.empty && <option value="" />}
              {selectData.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </form>

          {/* UI select */}
          <Portal>
            <div {...api.getPositionerProps()} className={styles.Positioner}>
              <ul {...api.getContentProps()} className={styles.Content}>
                {selectData.map((item) => (
                  <li key={item.value} {...api.getItemProps({ item })} className={styles.Item}>
                    <span {...api.getItemTextProps({ item })} className={styles.ItemText}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
