import { splitterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/splitter.css"

export default function Page() {
  const controls = useControls(splitterControls)

  const service = useMachine(
    splitter.machine,
    controls.mergeProps<splitter.Props>({
      id: createUniqueId(),
      panels: [
        { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 20 },
        { id: "b", minSize: 50 },
      ],
      defaultSize: [15, 85],
      onCollapse: (details) => {
        console.log("onCollapse", details)
      },
      onExpand: (details) => {
        console.log("onExpand", details)
      },
    }),
  )

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <>
      <main class="splitter">
        <div {...api().getRootProps()}>
          <div {...api().getPanelProps({ id: "a" })}>
            <p>A</p>
          </div>
          <div {...api().getResizeTriggerProps({ id: "a:b" })} />
          <div {...api().getPanelProps({ id: "b" })}>
            <p>B</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
