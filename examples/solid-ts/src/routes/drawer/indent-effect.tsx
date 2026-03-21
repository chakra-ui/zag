import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For, onMount } from "solid-js"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-indent.module.css"

const stack = drawer.createStack()

export default function Page() {
  const id = createUniqueId()
  const [snapshot, setSnapshot] = createSignal(stack.getSnapshot())

  onMount(() => stack.subscribe(() => setSnapshot(stack.getSnapshot())))

  const service = useMachine(drawer.machine, () => ({
    id,
    stack,
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))
  const stackApi = createMemo(() => drawer.connectStack(snapshot(), normalizeProps))

  return (
    <main class={styles.main}>
      <div
        {...stackApi().getIndentBackgroundProps()}
        class={styles.indentBackground}
        data-testid="drawer-indent-background"
      />

      <div {...stackApi().getIndentProps()} class={styles.indent} data-testid="drawer-indent">
        <h2 class={styles.heading}>Drawer Indent Effect</h2>
        <p class={styles.description}>
          Open and drag the drawer. The effect layer and app shell use stack snapshot props so styles stay coordinated.
        </p>
        <button {...api().getTriggerProps()} class={styles.button}>
          Open Drawer
        </button>
      </div>

      <Presence {...api().getBackdropProps()} class={styles.backdrop} />
      <div {...api().getPositionerProps()} class={styles.positioner}>
        <Presence {...api().getContentProps()} class={styles.content}>
          <div {...api().getGrabberProps()} class={styles.grabber}>
            <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
          </div>
          <div {...api().getTitleProps()} class={styles.title}>
            Drawer
          </div>
          <div class={styles.scrollable}>
            <For each={Array.from({ length: 30 })}>{(_element, index) => <div>Item {index() + 1}</div>}</For>
          </div>
        </Presence>
      </div>
    </main>
  )
}
