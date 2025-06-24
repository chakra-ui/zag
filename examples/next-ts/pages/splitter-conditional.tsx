import { normalizeProps, useMachine } from "@zag-js/react"
import { splitterControls } from "@zag-js/shared"
import * as splitter from "@zag-js/splitter"
import { useId, useState, useRef } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const initialPanels = [
    { id: "a", order: 0 },
    { id: "b", order: 1 },
    { id: "c", order: 2 },
  ]
  const initialLayout = splitter.layout(initialPanels)

  const [panels, setPanels] = useState(initialPanels)

  const [sizes, setSizes] = useState<number[]>([])
  const layoutCache = useRef<Record<string, number[]>>({
    [initialLayout]: [],
  })

  const service = useMachine(splitter.machine, {
    id: useId(),
    panels,
    size: sizes,
    onResize({ layout, size }) {
      setSizes(size)
      layoutCache.current[layout] = size
    },
  })

  const api = splitter.connect(service, normalizeProps)

  const hidePanel = (id: string) => {
    const index = panels.findIndex((panel) => panel.id === id)
    const newPanels = [...panels]
    newPanels.splice(index, 1)
    setPanels(newPanels)
    layoutCache.current[api.getLayout()] = sizes
    const newSizes = [...sizes]
    newSizes.splice(index, 1)
    setSizes(newSizes)
  }

  const showPanel = (id: string) => {
    const panel = initialPanels.find((panel) => panel.id === id)
    if (!panel) return
    const nextPanels = [...panels, panel]
    const nextLayout = splitter.layout(nextPanels)
    setPanels(nextPanels)
    setSizes(layoutCache.current[nextLayout])
  }

  return (
    <>
      <main className="splitter">
        <pre>{JSON.stringify(sizes, null, 2)}</pre>
        <button onClick={() => hidePanel("a")}>Hide Panel A</button>
        <button onClick={() => showPanel("a")}>Show Panel A</button>
        <div {...api.getRootProps()}>
          {api.getItems().map((item) => {
            if (item.type === "panel") {
              return (
                <div key={item.id} {...api.getPanelProps({ id: item.id })}>
                  <p>{item.id}</p>
                </div>
              )
            }
            return <div key={item.id} {...api.getResizeTriggerProps({ id: item.id })} />
          })}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
