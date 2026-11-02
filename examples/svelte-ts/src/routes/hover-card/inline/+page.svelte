<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card.css"

  const id = $props.id()
  const service = useMachine(hoverCard.machine, { id, openDelay: 300 })
  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<main class="hover-card">
  <p style="max-width: 360px; line-height: 2; font-size: 15px">
    Zag is built on
    <a href="#" data-testid="wrapped-trigger" {...api.getTriggerProps({ value: "a" })}>
      a set of framework agnostic state machines that describe every interaction a component supports, so the same logic
      runs everywhere
    </a>
    and behaves identically. Every machine ships
    <a href="#" data-testid="wrapped-trigger-2" {...api.getTriggerProps({ value: "b" })}>
      keyboard interactions and ARIA attributes that follow the authoring practices, tested across all the supported
      frameworks
    </a>
    before release.
  </p>

  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getArrowProps()}>
            <div {...api.getArrowTipProps()}></div>
          </div>
          Anchored to {api.triggerValue}
          <!-- Switches without the pointer reaching the other trigger. -->
          <button
            data-testid="switch-trigger"
            onclick={() => api.setTriggerValue(api.triggerValue === "a" ? "b" : "a")}
          >
            Switch
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
