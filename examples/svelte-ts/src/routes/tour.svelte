<script lang="ts">
  import Iframe from "$lib/components/iframe.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tourControls, tourData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { X } from "lucide-svelte"

  const controls = useControls(tourControls)

  const [snapshot, send] = useMachine(tour.machine({ id: "1", steps: tourData }), {
    context: controls.context,
  })

  const api = $derived(tour.connect(snapshot, send, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
    <div class="steps__container">
      <h3 id="step-1">Step 1</h3>
      <div class="overflow__container">
        <div class="h-200px"></div>
        <h3 id="step-2">Step 2</h3>
        <div class="h-100px"></div>
      </div>
      <Iframe>
        <h1 id="step-2a">Iframe Content</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua.
        </p>
      </Iframe>
      <h3 id="step-3">Step 3</h3>
      <h3 id="step-4">Step 4</h3>
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

          {#if api.step.actions}
            <div class="tour button__group">
              {#each api.step.actions as action}
                <button {...api.getActionTriggerProps({ action })}>{action.label}</button>
              {/each}
            </div>
          {/if}
          <button {...api.getCloseTriggerProps()}>
            <X />
          </button>
        </div>
      </div>
    </div>
  {/if}
</main>
