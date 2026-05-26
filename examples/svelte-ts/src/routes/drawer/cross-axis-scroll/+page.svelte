<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  const id = $props.id()

  const service = useMachine(drawer.machine, { id })

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main>
  <button class={styles.trigger} {...api.getTriggerProps()}>Open Drawer</button>
  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div class={styles.grabber} {...api.getGrabberProps()}>
        <div class={styles.grabberIndicator} {...api.getGrabberIndicatorProps()}></div>
      </div>
      <div {...api.getTitleProps()}>Cross-Axis Scroll</div>
      <p {...api.getDescriptionProps()}>
        Try scrolling the image carousel horizontally. It should scroll without triggering the drawer drag.
      </p>

      <div
        data-testid="horizontal-scroll"
        style="display: flex; gap: 12px; overflow-x: auto; padding: 16px"
      >
        {#each Array.from({ length: 10 }) as _, i}
          <div
            style="width: 200px; height: 120px; border-radius: 12px; flex-shrink: 0; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #6b7280"
          >
            {i + 1}
          </div>
        {/each}
      </div>

      <div class={styles.scrollable} data-testid="scrollable">
        {#each Array.from({ length: 50 }) as _, index}
          <div style="padding: 4px 16px">Item {index}</div>
        {/each}
      </div>
    </Presence>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["dragOffset", "snapPoint"]} />
</Toolbar>
