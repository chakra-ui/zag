import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectControls } from "@zag-js/shared"
import { useEffect, useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)

export default function Page() {
  const controls = useControls(selectControls)

  const [items, setItems] = useState([])

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
      items,
      id: useId(),
      getItemKey(item) {
        return item?.name
      },
    }),
    {
      context: { items },
    },
  )

  const api = select.connect(state, send, normalizeProps)

  return (
    <>
      <main className="select">
        <div className="control">
          <label {...api.labelProps}>Label</label>
          <button {...api.triggerProps}>
            <span>
              {api.hasSelectedItems ? api.selectedItems.map((item) => item.label).join(", ") : "Select option"}
            </span>
            <CaretIcon />
          </button>
        </div>

        <Portal>
          <div {...api.positionerProps}>
            <ul {...api.contentProps}>
              {items.map((item) => (
                <li key={item.name} {...api.getItemProps({ value: item })}>
                  <span className="item-label">{item.name}</span>
                  <span {...api.getItemIndicatorProps({ value: item })}>✓</span>
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} omit={["data", "items"]} />
      </Toolbar>
    </>
  )
}
