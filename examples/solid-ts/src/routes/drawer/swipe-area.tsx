import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../../shared/styles/drawer.module.css"

export default function Page() {
  const service = useMachine(drawer.machine, () => ({
    id: createUniqueId(),
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class={styles.swipeArea} {...api().getSwipeAreaProps()} />
        <Presence class={styles.backdrop} {...api().getBackdropProps()} />
        <div class={styles.positioner} {...api().getPositionerProps()}>
          <Presence class={styles.content} {...api().getContentProps()}>
            <div class={styles.grabber} {...api().getGrabberProps()}>
              <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
            </div>
            <div {...api().getTitleProps()}>Drawer</div>
            <p {...api().getDescriptionProps()}>Swipe up from the bottom edge to open this drawer.</p>
            <button {...api().getCloseTriggerProps()}>Close</button>
            <div class={styles.scrollable} data-testid="scrollable">
              <For each={Array.from({ length: 100 })}>{(_element, index) => <div>Item {index()}</div>}</For>
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "contentSize"]} />
      </Toolbar>
    </>
  )
}
