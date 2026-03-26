import styles from "../../../../../shared/src/css/splitter.module.css"
import { splitterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(splitterControls)

  const service = useMachine(
    splitter.machine,
    controls.mergeProps<splitter.Props>({
      id: createUniqueId(),
      panels: [{ id: "a" }, { id: "b" }],
    }),
  )

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <>
      <main class="splitter">
        <div {...api().getRootProps()} class={styles.Root}>
          <div {...api().getPanelProps({ id: "a" })} class={styles.Panel}>
            <p>A</p>
          </div>
          <div {...api().getResizeTriggerProps({ id: "a:b" })} class={styles.ResizeTrigger} />
          <div {...api().getPanelProps({ id: "b" })} class={styles.Panel}>
            <p>B</p>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} omit={["previousPanels", "initialSize"]} />
      </Toolbar>
    </>
  )
}
