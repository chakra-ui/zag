<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
  import "@styles/tour.css"

  const steps: tour.StepDetails[] = [
    {
      id: "dialog-intro",
      type: "dialog",
      title: "Dialog Step",
      description: "This is a centered dialog step with no target element.",
      actions: [{ label: "Next", action: "next" }],
    },
    {
      id: "tooltip-feature",
      type: "tooltip",
      target: () => document.querySelector<HTMLElement>("#feature-btn"),
      title: "Tooltip Step",
      description: "This tooltip points to a specific element on the page.",
      placement: "bottom",
      actions: [
        { label: "Prev", action: "prev" },
        { label: "Next", action: "next" },
      ],
    },
    {
      id: "wait-action",
      type: "wait",
      title: "",
      description: "",
      effect({ next }) {
        const btn = document.querySelector<HTMLElement>("#continue-btn")
        if (!btn) return
        const handler = () => next()
        btn.addEventListener("click", handler, { once: true })
        return () => btn.removeEventListener("click", handler)
      },
    },
    {
      id: "tooltip-after-wait",
      type: "tooltip",
      target: () => document.querySelector<HTMLElement>("#continue-btn"),
      title: "Back to Tooltip",
      description: "After the wait step, we're back to a tooltip. Placement styles should be clean.",
      placement: "top",
      actions: [{ label: "Next", action: "next" }],
    },
    {
      id: "dialog-after-tooltip",
      type: "dialog",
      title: "Dialog After Tooltip",
      description: "Switching back to dialog. Old tooltip positioning styles should be fully cleaned up.",
      actions: [{ label: "Next", action: "next" }],
    },
    {
      id: "floating-end",
      type: "floating",
      title: "Floating Step",
      description: "A floating step with no backdrop or arrow.",
      actions: [{ label: "Done", action: "dismiss" }],
    },
  ]

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps })

  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
    <div class="steps__container">
      <button id="feature-btn">Feature Button</button>
      <button id="continue-btn">Continue</button>
      {#if api.step?.type === "wait"}
        <p>Click "Continue" to proceed...</p>
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
        </div>
      </div>
    </Portal>
  {/if}
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["steps"]} />
</Toolbar>
