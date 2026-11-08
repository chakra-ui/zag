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
      panels: [{ id: "a" }, { id: "b" }, { id: "c" }],
    }),
  )

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <>
      <main class="splitter">
        <pre>{JSON.stringify(api().getSizes())}</pre>
        <div {...api().getRootProps()}>
          <div {...api().getPanelProps({ id: "a" })}>
            <p>Left</p>
          </div>
          <div data-testid="trigger-a:b" {...api().getResizeTriggerProps({ id: "a:b" })} />
          <div {...api().getPanelProps({ id: "b" })}>
            <p>Middle</p>
          </div>
          <div data-testid="trigger-b:c" {...api().getResizeTriggerProps({ id: "b:c" })} />
          <div {...api().getPanelProps({ id: "c" })}>
            <p>Right</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["previousPanels", "initialSize"]} />
      </Toolbar>
    </>
  )
}
