import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { drawerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import styles from "../../../shared/styles/drawer.module.css"

export default function Page() {
  const controls = useControls(drawerControls)

  const service = useMachine(
    drawer.machine,
    controls.mergeProps({
      id: createUniqueId(),
      snapPoints: [0.25, "250px", 1],
      defaultSnapPoint: 0.25,
    }),
  )

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <button class={styles.trigger} {...api().getTriggerProps()}>
          Open
        </button>
        <div class={styles.backdrop} {...api().getBackdropProps()} />
        <div class={styles.positioner} {...api().getPositionerProps()}>
          <div class={styles.content} {...api().getContentProps()}>
            <div class={styles.grabber} {...api().getGrabberProps()}>
              <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
            </div>
            <div {...api().getTitleProps()}>Drawer</div>
            <div data-no-drag="true" class={styles.noDrag}>
              No drag area
            </div>
            <div class={styles.scrollable}>
              <For each={Array.from({ length: 100 })}>{(_element, index) => <div>Item {index()}</div>}</For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
      </Toolbar>
    </>
  )
}
