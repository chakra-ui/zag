import { splitterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const [state, send] = useMachine(
    splitter.machine({
      id: createUniqueId(),
      size: [
        { id: "a", size: 50 },
        { id: "b", size: 50 },
      ],
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => splitter.connect(state, send, normalizeProps))

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

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["previousPanels", "initialSize"]} />
      </Toolbar>
    </>
  )
}
