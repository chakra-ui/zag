<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Presence from "$lib/components/presence.svelte"
  import { onMount } from "svelte"
  import styles from "../../../../../shared/styles/drawer-indent.module.css"

  const stack = drawer.createStack()

  const id = $props.id()

  let snapshot = $state(stack.getSnapshot())

  onMount(() => {
    return stack.subscribe(() => {
      snapshot = stack.getSnapshot()
    })
  })

  const service = useMachine(drawer.machine, {
    id,
    stack,
  })

  const api = $derived(drawer.connect(service, normalizeProps))
  const stackApi = $derived(drawer.connectStack(snapshot, normalizeProps))
</script>

<main class={styles.main}>
  <div
    {...stackApi.getIndentBackgroundProps()}
    class={styles.indentBackground}
    data-testid="drawer-indent-background"
  ></div>

  <div {...stackApi.getIndentProps()} class={styles.indent} data-testid="drawer-indent">
    <h2 class={styles.heading}>Drawer Indent Background</h2>
    <p class={styles.description}>
      Open and drag the drawer. The background and app shell use stack snapshot props so styles stay coordinated.
    </p>
    <button {...api.getTriggerProps()} class={styles.button}>Open Drawer</button>
  </div>

  <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...api.getPositionerProps()} class={styles.positioner}>
    <Presence {...api.getContentProps()} class={styles.content}>
      <div {...api.getGrabberProps()} class={styles.grabber}>
        <div {...api.getGrabberIndicatorProps()} class={styles.grabberIndicator}></div>
      </div>
      <div {...api.getTitleProps()} class={styles.title}>Drawer</div>
      <div class={styles.scrollable}>
        {#each Array.from({ length: 30 }) as _, index}
          <div>Item {index + 1}</div>
        {/each}
      </div>
    </Presence>
  </div>
</main>
