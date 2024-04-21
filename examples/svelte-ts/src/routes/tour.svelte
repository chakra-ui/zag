<script lang="ts">
  import Iframe from "$lib/components/iframe.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tourControls, tourData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"

  const controls = useControls(tourControls)

  const [state, send] = useMachine(tour.machine({ id: "1", steps: tourData }), {
    context: controls.context,
  })

  const api = $derived(tour.connect(state, send, normalizeProps))
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

  <div use:portal>
    <div {...api.overlayProps}></div>
    <div {...api.spotlightProps}></div>
    <div {...api.positionerProps}>
      {#if api.currentStep}
        <div {...api.contentProps}>
          <div {...api.arrowProps}>
            <div {...api.arrowTipProps}></div>
          </div>
          <p {...api.titleProps}>{api.currentStep.title}</p>
          <div {...api.descriptionProps}>{api.currentStep.description}</div>

          <div class="tour button__group">
            <button {...api.prevTriggerProps}>Prev</button>
            <button {...api.nextTriggerProps}>Next</button>
            {#if api.isLastStep}
              <button {...api.closeTriggerProps} style="margin-left:auto;"> Close </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>
