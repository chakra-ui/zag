import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls } from "@zag-js/shared"
import { useEffect, useId, useMemo, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

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

  const [state, send] = useMachine(
    select.machine({
      collection: select.collection({
        items,
        itemToString(item) {
          return item.name
        },
        itemToValue(item) {
          return item.name
        },
      }),
      id: useId(),
    }),
    {
      context: {
        ...controls.context,
        collection: useMemo(
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
        ),
      },
    },
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <>
      <main className="select">
        <div {...api.rootProps}>
          <label {...api.labelProps}>Label</label>
          <div {...api.controlProps}>
            <button {...api.triggerProps}>
              <span>{api.hasSelectedItems ? api.valueAsString : "Select option"}</span>
              <span>▼</span>
            </button>
            <button {...api.clearTriggerProps}>X</button>
          </div>

          <Portal>
            <div {...api.positionerProps}>
              <ul {...api.contentProps}>
                {items.map((item) => (
                  <li key={item.name} {...api.getItemProps({ item })}>
                    <span className="item-label">{item.name}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} omit={["collection"]} />
      </Toolbar>
    </>
  )
}
