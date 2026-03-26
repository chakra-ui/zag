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
  <div {...api.getSwipeAreaProps()} class={styles.swipeArea}></div>
  <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...api.getPositionerProps()} class={styles.positioner}>
    <Presence {...api.getContentProps()} class={styles.content}>
      <div {...api.getGrabberProps()} class={styles.grabber}>
        <div {...api.getGrabberIndicatorProps()} class={styles.grabberIndicator}></div>
      </div>
      <div {...api.getTitleProps()}>Drawer</div>
      <p {...api.getDescriptionProps()}>Swipe up from the bottom edge to open this drawer.</p>
      <button {...api.getCloseTriggerProps()}>Close</button>
      <div class={styles.scrollable} data-testid="scrollable">
        {#each Array.from({ length: 100 }) as _, index}
          <div>Item {index}</div>
        {/each}
      </div>
    </Presence>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["dragOffset", "snapPoint", "contentSize"]} />
</Toolbar>
