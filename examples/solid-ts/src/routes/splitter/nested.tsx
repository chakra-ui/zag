import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createContext, createMemo, createUniqueId, useContext, type ParentProps } from "solid-js"

const registry = splitter.registry({
  hitAreaMargins: { coarse: 15, fine: 8 },
})

const PanelContext = createContext<() => splitter.Api>()

function PanelGroup(props: ParentProps<Omit<splitter.Props, "id">>) {
  const id = createUniqueId()
  const service = useMachine(splitter.machine, {
    ...props,
    id,
    registry,
  })
  const api = createMemo(() => splitter.connect(service, normalizeProps))
  return (
    <PanelContext.Provider value={api}>
      <div {...api().getRootProps()}>{props.children}</div>
    </PanelContext.Provider>
  )
}

function Panel(props: ParentProps<splitter.PanelProps>) {
  const api = useContext(PanelContext)!
  return <div {...api().getPanelProps(props)}>{props.children}</div>
}

function ResizeTrigger(props: splitter.ResizeTriggerProps) {
  const api = useContext(PanelContext)!
  return <div {...api().getResizeTriggerProps(props)} />
}

export default function Page() {
  return (
    <main>
      <PanelGroup
        orientation="horizontal"
        defaultSize={[20, 60, 20]}
        panels={[{ id: "left" }, { id: "center" }, { id: "right" }]}
      >
        <Panel id="left">
          <div style={{ background: "#f0f8ff", padding: "20px", width: "100%", height: "100%" }}>
            <h3>Left Panel</h3>
          </div>
        </Panel>
        <ResizeTrigger id="left:center" />
        <Panel id="center">
          <PanelGroup orientation="vertical" panels={[{ id: "top" }, { id: "middle" }, { id: "bottom" }]}>
            <Panel id="top">
              <div style={{ background: "#fff0f5", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Top Panel</h3>
              </div>
            </Panel>
            <ResizeTrigger id="top:middle" />
            <Panel id="middle">
              <div style={{ background: "#f0fff0", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Middle Panel</h3>
              </div>
            </Panel>
            <ResizeTrigger id="middle:bottom" />
            <Panel id="bottom">
              <div style={{ background: "#fffacd", padding: "20px", width: "100%", height: "100%" }}>
                <h3>Bottom Panel</h3>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
        <ResizeTrigger id="center:right" />
        <Panel id="right">
          <div style={{ background: "#f5f5dc", padding: "20px", width: "100%", height: "100%" }}>
            <h3>Right Panel</h3>
          </div>
        </Panel>
      </PanelGroup>

      <p style={{ "margin-top": "20px" }}>
        Drag at the intersection of resize handles to resize both directions simultaneously.
      </p>
    </main>
  )
}
