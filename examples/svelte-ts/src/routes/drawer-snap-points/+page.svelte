<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { drawerControls } from "@zag-js/shared"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../shared/styles/drawer.module.css"

  const controls = useControls(drawerControls)

  const id = $props.id()
  const service = useMachine(
    drawer.machine,
    controls.mergeProps<drawer.Props>({
      id,
      snapPoints: [0.25, "250px", 1],
    }),
  )

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main>
  <button class={styles.trigger} {...api.getTriggerProps()}>Open</button>
  <Presence class={styles.backdrop} {...api.getBackdropProps()}></Presence>
  <div class={styles.positioner} {...api.getPositionerProps()}>
    <Presence class={styles.content} {...api.getContentProps()}>
      <div class={styles.grabber} {...api.getGrabberProps()}>
        <div class={styles.grabberIndicator} {...api.getGrabberIndicatorProps()}></div>
      </div>
      <div {...api.getTitleProps()}>Drawer</div>
      <div data-no-drag="true" class={styles.noDrag}>No drag area</div>
      <div class={styles.scrollable}>
        {#each Array.from({ length: 100 }) as _, index}
          <div>Item {index}</div>
        {/each}
      </div>
    </Presence>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
</Toolbar>
