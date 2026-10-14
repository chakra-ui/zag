<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tourControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
  import "@styles/tour.css"

  const steps: tour.StepDetails[] = [
    {
      type: "dialog",
      id: "intro",
      title: "Welcome",
      description: "This tour uses Presence so content stays mounted during the exit animation.",
      actions: [{ label: "Next", action: "next" }],
    },
    {
      type: "tooltip",
      id: "search",
      title: "Search",
      description: "Find anything from here.",
      target: () => document.querySelector<HTMLElement>("#tour-search"),
      actions: [
        { label: "Prev", action: "prev" },
        { label: "Next", action: "next" },
      ],
    },
    {
      type: "tooltip",
      id: "profile",
      title: "Profile",
      description: "Finish here to watch the tooltip exit animation.",
      target: () => document.querySelector<HTMLElement>("#tour-profile"),
      actions: [
        { label: "Prev", action: "prev" },
        { label: "Finish", action: "dismiss" },
      ],
    },
  ]

  const controls = useControls(tourControls)

  const id = $props.id()
  const service = useMachine(
    tour.machine,
    controls.mergeProps<tour.Props>({
      id,
      steps,
    }),
  )

  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
    <pre
      data-testid="tour-debug"
      style="margin-top: 12px; font-size: 12px">{`open=${String(api.open)} stepId=${api.step?.id ?? "null"} title=${api.step?.title ?? "(empty)"}`}</pre>
    <div style="display: flex; gap: 16px; margin-top: 24px">
      <button id="tour-search" type="button">Search</button>
      <button id="tour-profile" type="button">Profile</button>
    </div>
  </div>

  <Portal>
    <Presence {...api.getBackdropProps()} lazyMount unmountOnExit />
    <Presence {...api.getSpotlightProps()} lazyMount unmountOnExit />
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()} lazyMount unmountOnExit>
        {#if api.step}
          {#if api.step.arrow}
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()}></div>
            </div>
          {/if}

          <p {...api.getTitleProps()}>{api.step.title}</p>
          <div {...api.getDescriptionProps()}>{api.step.description}</div>
          <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

          {#if api.step.actions}
            <div class="tour button__group">
              {#each api.step.actions as action (action.label)}
                <button {...api.getActionTriggerProps({ action })}>{action.label}</button>
              {/each}
            </div>
          {/if}

          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        {:else}
          <p data-testid="step-cleared-during-exit" style="color: crimson; font-weight: 700">
            STEP CLEARED DURING EXIT (bug)
          </p>
        {/if}
      </Presence>
    </div>
  </Portal>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["steps"]} />
</Toolbar>
