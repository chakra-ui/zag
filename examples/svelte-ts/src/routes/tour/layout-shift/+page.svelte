<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { tourLayoutShiftData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
  import "@styles/tour.css"

  // A fixed-height root that gains overflow — the layout change a ResizeObserver cannot see.
  const layoutShiftStyles = `
    html { height: 100%; }
    body { min-height: 100%; }
    body, .page, .page main { overflow: visible; }
    .page { height: auto; min-height: 100vh; }
    .page main { display: block; }
    .nav { flex-shrink: 0; height: 100vh; }

    .layout-shift { padding: 40px; }
    .layout-shift .targets { display: flex; gap: 80px; margin-top: 40px; }
    .layout-shift .targets button { width: 160px; }
    .layout-shift .targets button[data-wide] { width: 280px; }
    .layout-shift .filler { height: 100px; padding-top: 40px; }
    .layout-shift .filler[data-expanded] { height: 2000px; }
  `

  let wide = $state(false)
  let expanded = $state(false)

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps: tourLayoutShiftData })
  const api = $derived(tour.connect(service, normalizeProps))
</script>

<svelte:head>
  {@html `<style>${layoutShiftStyles}</style>`}
</svelte:head>

<main class="tour layout-shift">
  <button onclick={() => api.start()}>Start tour</button>

  <div class="targets">
    <button id="layout-target" data-wide={wide || undefined}>First target</button>
    <button id="other-target" data-wide={wide || undefined}>Second target</button>
  </div>

  <div class="filler" data-expanded={expanded || undefined}>
    {expanded ? "Extra content is in the page." : "Use the tour controls to shift the layout."}
  </div>
</main>

{#if api.open}
  <Portal>
    <div {...api.getBackdropProps()}></div>
    <div {...api.getSpotlightProps()}></div>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <p {...api.getTitleProps()}>{api.step?.title}</p>
        <div {...api.getDescriptionProps()}>{api.step?.description}</div>

        <div class="tour button__group">
          <button onclick={() => (wide = !wide)}>Resize target</button>
          <button onclick={() => (expanded = !expanded)}>Toggle extra content</button>
          {#each api.step?.actions ?? [] as action (action.label)}
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
