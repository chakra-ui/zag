<script lang="ts">
  import * as bottomSheet from "@zag-js/bottom-sheet"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { bottomSheetControls } from "@zag-js/shared"
  import Presence from "$lib/components/presence.svelte"

  const controls = useControls(bottomSheetControls)

  const id = $props.id()
  const service = useMachine(
    bottomSheet.machine,
    controls.mergeProps<bottomSheet.Props>({
      id,
      snapPoints: [0.25, "250px", 1],
      defaultActiveSnapPoint: 0.25,
    }),
  )

  const api = $derived(bottomSheet.connect(service, normalizeProps))
</script>

<main class="bottom-sheet">
  <button {...api.getTriggerProps()}>Open</button>
  <Presence {...api.getBackdropProps()}></Presence>
  <Presence {...api.getContentProps()}>
    <div {...api.getGrabberProps()}>
      <div {...api.getGrabberIndicatorProps()}></div>
    </div>
    <div {...api.getTitleProps()}>Bottom Sheet</div>
    <div data-no-drag="true">No drag area</div>
    <div class="scrollable">
      {#each Array.from({ length: 100 }) as _, index}
        <div>Item {index}</div>
      {/each}
    </div>
  </Presence>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["dragOffset", "activeSnapPoint", "resolvedActiveSnapPoint"]} />
</Toolbar>
