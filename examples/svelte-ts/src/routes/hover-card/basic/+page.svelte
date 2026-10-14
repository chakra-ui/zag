<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { hoverCardControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card.css"

  const controls = useControls(hoverCardControls)

  const id = $props.id()
  const service = useMachine(hoverCard.machine, controls.mergeProps<hoverCard.Props>({ id }))

  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<main class="hover-card">
  <div style="display: flex; gap: 50px">
    <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api.getTriggerProps()}>@zag_js</a>

    {#if api.open}
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()}></div>
            </div>
            <div class="profile">
              <span class="profile-avatar" aria-hidden="true">Z</span>
              <div class="profile-body">
                <span class="profile-name">Zag.js</span>
                <span class="profile-handle">@zag_js</span>
                <p class="profile-bio">
                  UI components powered by finite state machines. Works with React, Solid, Vue and Svelte.
                </p>
                <a class="profile-meta" href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                  twitter.com/zag_js
                </a>
              </div>
            </div>
          </div>
        </div>
      </Portal>
    {/if}

    <div data-testid="test-text">Test text</div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
