import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine, useSyncExternalStore } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-indent-effect.module.css"

const stack = drawer.createStack()

export default function Page() {
  const id = createUniqueId()
  const snapshot = useSyncExternalStore(stack.subscribe, stack.getSnapshot)

  const service = useMachine(drawer.machine, () => ({
    id,
    stack,
    modal: false,
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))
  const stackApi = createMemo(() => drawer.connectStack(snapshot(), normalizeProps))

  return (
    <main class={styles.page}>
      <div class={styles.sandbox}>
        <div
          {...stackApi().getIndentBackgroundProps()}
          class={styles.indentBackground}
          data-testid="drawer-indent-background"
        />

        <div {...stackApi().getIndentProps()} class={styles.indent} data-testid="drawer-indent">
          <div class={styles.center}>
            <button class={styles.trigger} {...api().getTriggerProps()}>
              Open drawer
            </button>
          </div>
        </div>

        <Presence {...api().getBackdropProps()} class={styles.backdrop} />
        <div {...api().getPositionerProps()} class={styles.positioner}>
          <Presence {...api().getContentProps()} class={styles.content}>
            <div {...api().getGrabberProps()} class={styles.grabber}>
              <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
            </div>
            <div class={styles.contentInner}>
              <h2 class={styles.title} {...api().getTitleProps()}>
                Notifications
              </h2>
              <p class={styles.description} {...api().getDescriptionProps()}>
                You are all caught up. Good job!
              </p>
              <div class={styles.actions}>
                <button class={styles.close} {...api().getCloseTriggerProps()}>
                  Close
                </button>
              </div>
            </div>
          </Presence>
        </div>
      </div>
    </main>
  )
}
