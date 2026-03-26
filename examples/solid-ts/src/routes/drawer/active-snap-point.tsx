import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { drawerControls } from "@zag-js/shared"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import styles from "../../../../shared/styles/drawer.module.css"

export default function Page() {
  const controls = useControls(drawerControls)

  const service = useMachine(
    drawer.machine,
    controls.mergeProps({
      id: createUniqueId(),
      snapPoints: ["20rem", 1],
      defaultSnapPoint: "20rem",
    }),
  )

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <button {...api().getTriggerProps()} class={styles.trigger}>
          Open
        </button>
        <Presence {...api().getBackdropProps()} class={styles.backdrop} />
        <div {...api().getPositionerProps()} class={styles.positioner}>
          <Presence {...api().getContentProps()} class={styles.content}>
            <div {...api().getGrabberProps()} class={styles.grabber}>
              <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
            </div>
            <div {...api().getTitleProps()}>Drawer</div>
            <div data-no-drag="true" class={styles.noDrag}>
              No drag area
            </div>
            <div class={styles.scrollable}>
              <For each={Array.from({ length: 100 })}>{(_element, index) => <div>Item {index()}</div>}</For>
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
      </Toolbar>
    </>
  )
}
