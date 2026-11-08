import { normalizeProps, useMachine } from "@zag-js/preact"
import * as splitter from "@zag-js/splitter"
import { useId, useState } from "preact/hooks"
import "@styles/splitter.css"

export default function Page() {
  const [disabled, setDisabled] = useState(false)
  const [lockA, setLockA] = useState(false)
  const [disableAll, setDisableAll] = useState(false)
  const [resizeCount, setResizeCount] = useState(0)
  const [resizeEnd, setResizeEnd] = useState<string[]>([])
  const [collapseLog, setCollapseLog] = useState<string[]>([])

  const service = useMachine(splitter.machine, {
    id: useId(),
    defaultSize: [25, 50, 25],
    disabled: disableAll,
    panels: [
      { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 40, disabled: lockA },
      { id: "b", minSize: 20 },
      { id: "c", minSize: 20 },
    ],
    onResize() {
      setResizeCount((count) => count + 1)
    },
    onResizeEnd({ size }) {
      setResizeEnd((prev) => [...prev, size.map(Math.round).join("/")])
    },
    onCollapse({ panelId }) {
      setCollapseLog((prev) => [...prev, `collapse:${panelId}`])
    },
    onExpand({ panelId }) {
      setCollapseLog((prev) => [...prev, `expand:${panelId}`])
    },
  })

  const api = splitter.connect(service, normalizeProps)

  return (
    <main className="splitter">
      <div className="controls">
        <button onClick={() => api.collapsePanel("a")}>Collapse A</button>
        <button onClick={() => api.expandPanel("a")}>Expand A</button>
        <button onClick={() => setDisabled((value) => !value)}>{disabled ? "Enable" : "Disable"} second handle</button>
        <button onClick={() => api.resizePanel("a", "200px")}>Resize A to 200px</button>
        <button onClick={() => setLockA((value) => !value)}>{lockA ? "Unlock" : "Lock"} A</button>
        <button onClick={() => setDisableAll((value) => !value)}>{disableAll ? "Enable" : "Disable"} splitter</button>
      </div>

      <div {...api.getRootProps()}>
        <div {...api.getPanelProps({ id: "a" })}>
          <p>A</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "a:b" })} />
        <div {...api.getPanelProps({ id: "b" })}>
          <p>B</p>
        </div>
        <div {...api.getResizeTriggerProps({ id: "b:c", disabled })} />
        <div {...api.getPanelProps({ id: "c" })}>
          <p>C</p>
        </div>
      </div>

      <p>
        Sizes: <output aria-label="Sizes">{api.getSizes().map(Math.round).join("/")}</output>
      </p>
      <p>
        onResize calls: <output aria-label="Resize count">{resizeCount}</output>
      </p>
      <p>
        onResizeEnd: <output aria-label="Resize end reports">{resizeEnd.join(",") || "-"}</output>
      </p>
      <p>
        onCollapse / onExpand: <output aria-label="Collapse reports">{collapseLog.join(",") || "-"}</output>
      </p>
    </main>
  )
}
