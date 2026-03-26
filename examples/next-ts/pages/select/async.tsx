import styles from "../../../../shared/src/css/select.module.css"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls } from "@zag-js/shared"
import { useEffect, useId, useMemo, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(selectControls)

  const [items, setItems] = useState<{ name: string; url: string }[]>([])

  useEffect(() => {
    async function load() {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
      const json = await res.json()
      setItems(json.results)
    }

    load()
  }, [])

  const collection = useMemo(
    () =>
      select.collection({
        items,
        itemToString(item) {
          return item.name
        },
        itemToValue(item) {
          return item.name
        },
      }),
    [items],
  )

  const service = useMachine(select.machine, {
    id: useId(),
    collection,
  })

  const api = select.connect(service, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()} className={styles.Label}>Label</label>
          <div {...api.getControlProps()} className={styles.Control}>
            <button {...api.getTriggerProps()} className={styles.Trigger}>
              <span>{api.hasSelectedItems ? api.valueAsString : "Select option"}</span>
              <span>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>X</button>
          </div>

          <Portal>
            <div {...api.getPositionerProps()} className={styles.Positioner}>
              <ul {...api.getContentProps()} className={styles.Content}>
                {items.map((item) => (
                  <li key={item.name} {...api.getItemProps({ item })} className={styles.Item}>
                    <span {...api.getItemTextProps({ item })} className={styles.ItemText}>{item.name}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
