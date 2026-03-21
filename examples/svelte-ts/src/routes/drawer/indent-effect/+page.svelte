<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine, useSyncExternalStore } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer-indent-effect.module.css"

  const stack = drawer.createStack()

  const id = $props.id()

  const snapshot = useSyncExternalStore(stack.subscribe, stack.getSnapshot)
  const stackApi = $derived(drawer.connectStack(snapshot(), normalizeProps))

  const service = useMachine(drawer.machine, {
    id,
    stack,
    modal: false,
  })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main class={styles.page}>
  <div class={styles.sandbox}>
    <div
      {...stackApi.getIndentBackgroundProps()}
      class={styles.indentBackground}
      data-testid="drawer-indent-background"
    ></div>

    <div {...stackApi.getIndentProps()} class={styles.indent} data-testid="drawer-indent">
      <div class={styles.center}>
        <button class={styles.trigger} {...api.getTriggerProps()}>Open drawer</button>
      </div>
    </div>

    <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
    <div {...api.getPositionerProps()} class={styles.positioner}>
      <Presence {...api.getContentProps()} class={styles.content}>
        <div {...api.getGrabberProps()} class={styles.grabber}>
          <div {...api.getGrabberIndicatorProps()} class={styles.grabberIndicator}></div>
        </div>
        <div class={styles.contentInner}>
          <h2 class={styles.title} {...api.getTitleProps()}>Notifications</h2>
          <p class={styles.description} {...api.getDescriptionProps()}>You are all caught up. Good job!</p>
          <div class={styles.actions}>
            <button class={styles.close} {...api.getCloseTriggerProps()}>Close</button>
          </div>
        </div>
      </Presence>
    </div>
  </div>
</main>
