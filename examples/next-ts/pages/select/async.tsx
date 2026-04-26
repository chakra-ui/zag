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
          <label {...api.getLabelProps()}>Label</label>
          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <span>{api.hasSelectedItems ? api.valueAsString : "Select option"}</span>
              <span>▼</span>
            </button>
            <button {...api.getClearTriggerProps()}>X</button>
          </div>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                <div {...api.getListProps()}>
                  {items.map((item) => (
                    <div key={item.name} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.name}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
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
