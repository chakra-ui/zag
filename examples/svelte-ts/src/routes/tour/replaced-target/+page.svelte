<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { tourReplacedTargetData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
  import "@styles/tour.css"

  let replaced = $state(false)

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps: tourReplacedTargetData })
  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
    <button onclick={() => (replaced = true)}>Replace target</button>

    <div class="steps__container">
      <!-- The same target id, carried by one node or the other -->
      {#if !replaced}
        <h3 id="target">Original target</h3>
      {/if}
      <div class="h-200px"></div>
      {#if replaced}
        <h3 id="target">Replacement target</h3>
      {/if}
    </div>
  </div>

  {#if api.step && api.open}
    <Portal>
      {#if api.step.backdrop}
        <div {...api.getBackdropProps()}></div>
      {/if}
      <div {...api.getSpotlightProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          {#if api.step.arrow}
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()}></div>
            </div>
          {/if}

          <p {...api.getTitleProps()}>{api.step.title}</p>
          <div {...api.getDescriptionProps()}>{api.step.description}</div>

          <div class="tour button__group">
            {#each api.step.actions ?? [] as action (action.label)}
              <button {...api.getActionTriggerProps({ action })}>{action.label}</button>
            {/each}
          </div>

          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
