import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createContext, createMemo, createUniqueId, splitProps, useContext, type ParentProps } from "solid-js"
import "@styles/splitter.css"

const PanelContext = createContext<() => splitter.Api>()

function PanelGroup(props: ParentProps<Omit<splitter.Props, "id">>) {
  // Spreading props would eagerly render children outside the provider
  const [local, machineProps] = splitProps(props, ["children"])
  const id = createUniqueId()
  const service = useMachine(splitter.machine, { ...machineProps, id })
  const api = createMemo(() => splitter.connect(service, normalizeProps))
  return (
    <PanelContext.Provider value={api}>
      <div {...api().getRootProps()}>{local.children}</div>
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
        panels={[
          { id: "a", order: 0, minSize: 20 },
          { id: "b", order: 1, collapsible: true },
          { id: "c", order: 2, minSize: 20 },
        ]}
      >
        <Panel id="a">Left</Panel>
        <ResizeTrigger id="a:b" />
        <Panel id="b">
          <PanelGroup
            orientation="vertical"
            panels={[
              { id: "b1", order: 0 },
              { id: "b2", order: 1, collapsible: true },
            ]}
          >
            <Panel id="b1">top</Panel>
            <ResizeTrigger id="b1:b2" />
            <Panel id="b2">
              <PanelGroup
                orientation="horizontal"
                panels={[
                  { id: "b21", order: 0 },
                  { id: "b22", order: 1, collapsible: true },
                ]}
              >
                <Panel id="b21">left</Panel>
                <ResizeTrigger id="b21:b22" />
                <Panel id="b22">right</Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </Panel>
        <ResizeTrigger id="b:c" />
        <Panel id="c">right</Panel>
      </PanelGroup>
    </main>
  )
}
