<script lang="ts">
  import * as drawer from "@zag-js/drawer"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { drawerControls } from "@zag-js/shared"
  import Presence from "$lib/components/presence.svelte"
  import styles from "../../../../../shared/styles/drawer.module.css"

  const controls = useControls(drawerControls)

  const id = $props.id()
  const service = useMachine(
    drawer.machine,
    controls.mergeProps<drawer.Props>({
      id,
      snapPoints: ["20rem", 1],
    }),
  )

  const api = $derived(drawer.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()} class={styles.trigger}>Open</button>
  <Presence {...api.getBackdropProps()} class={styles.backdrop}></Presence>
  <div {...api.getPositionerProps()} class={styles.positioner}>
    <Presence {...api.getContentProps()} class={styles.content}>
      <div {...api.getGrabberProps()} class={styles.grabber}>
        <div {...api.getGrabberIndicatorProps()} class={styles.grabberIndicator}></div>
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
