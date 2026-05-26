import { normalizeProps, useMachine } from "@zag-js/react"
import * as splitter from "@zag-js/splitter"
import { createContext, useContext, useId } from "react"

const registry = splitter.registry({
  // Touch-friendly margins
  hitAreaMargins: { coarse: 15, fine: 8 },
})

const PanelContext = createContext({} as splitter.Api)

const PanelGroup = (props: React.PropsWithChildren<Omit<splitter.Props, "id">>) => {
  const id = useId()
  const service = useMachine(splitter.machine, {
    ...props,
    id,
    registry, // Enable multi-drag
  })
  const api = splitter.connect(service, normalizeProps)
  return (
    <PanelContext.Provider value={api}>
      <div {...api.getRootProps()}>{props.children}</div>
    </PanelContext.Provider>
  )
}

const Panel = (props: React.PropsWithChildren<splitter.PanelProps>) => {
  const api = useContext(PanelContext)
  return <div {...api.getPanelProps(props)}>{props.children}</div>
}

const ResizeTrigger = (props: splitter.ResizeTriggerProps) => {
  const api = useContext(PanelContext)
  return <div {...api.getResizeTriggerProps(props)} />
}

export default function Page() {
  return (
    <main>
      <div style={{ marginBottom: "20px" }}>
        <h2>Nested Splitters with Multi-Drag</h2>
        <p>
          Try dragging at the intersection of the horizontal and vertical resize handles. When your cursor is at the
          intersection, both splitters will resize simultaneously!
        </p>
      </div>

      <PanelGroup
        orientation="horizontal"
        defaultSize={[20, 60, 20]}
        panels={[{ id: "left" }, { id: "center" }, { id: "right" }]}
      >
        <Panel id="left">
          <div style={{ background: "#f0f8ff", padding: "20px", width: "100%", height: "100%" }}>
            <h3>Left Panel</h3>
            <p>This is a fixed horizontal panel.</p>
          </div>
        </Panel>
        <ResizeTrigger id="left:center" />
        <Panel id="center">
          <PanelGroup orientation="vertical" panels={[{ id: "top" }, { id: "middle" }, { id: "bottom" }]}>
            <Panel id="top">
              <div style={{ background: "#fff0f5", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Top Panel</h3>
                <p>This is the top section of the vertical splitter.</p>
              </div>
            </Panel>
            <ResizeTrigger id="top:middle" />
            <Panel id="middle">
              <div style={{ background: "#f0fff0", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Middle Panel</h3>
                <p>
                  <strong>Multi-drag intersection zone:</strong> Move your cursor to the left edge of this panel where
                  it meets the horizontal resize handle. You'll see the cursor change to a "move" cursor, allowing you
                  to resize both dimensions at once!
                </p>
              </div>
            </Panel>
            <ResizeTrigger id="middle:bottom" />
            <Panel id="bottom">
              <div style={{ background: "#fffacd", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Bottom Panel</h3>
                <p>This is the bottom section.</p>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <ResizeTrigger id="center:right" />
        <Panel id="right">
          <div style={{ background: "#f5f5dc", padding: "20px", width: "100%", height: "100%" }}>
            <h3>Right Panel</h3>
            <p>This is a fixed horizontal panel.</p>
          </div>
        </Panel>
      </PanelGroup>

      <p style={{ marginTop: "20px" }}>
        Drag at the intersection of resize handles to resize both directions simultaneously.
      </p>
    </main>
  )
}
