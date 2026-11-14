<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { tourLateTargetData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { X } from "lucide-svelte"

  let shown = $state(false)

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps: tourLateTargetData, targetTimeout: 5000 })
  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
    <button onclick={() => (shown = true)}>Show target</button>

    <div class="steps__container">
      {#if shown}
        <h3 id="late-target">Target</h3>
      {/if}
    </div>
  </div>

  {#if api.open && api.step}
    <div use:portal>
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
            <X />
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
