<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Uptime from "$lib/components/dialog-uptime.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  let modal = $state(false)
  let trapFocus = $state(true)
  let preventScroll = $state(true)

  const id = $props.id()
  const service = useMachine(dialog.machine, () => ({
    id,
    defaultOpen: true,
    modal,
    trapFocus,
    preventScroll,
  }))

  const api = $derived(dialog.connect(service, normalizeProps))

  const minimized = $derived(!trapFocus && !preventScroll)
  const toggleMinimized = () => {
    const next = minimized
    trapFocus = next
    preventScroll = next
  }
</script>

<main class="dialog">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <button data-testid="toggle-minimized" onclick={toggleMinimized}>
      {minimized ? "Maximize" : "Minimize"}
    </button>
    <button data-testid="toggle-trap" onclick={() => (trapFocus = !trapFocus)}>
      trapFocus: {String(trapFocus)}
    </button>
    <button data-testid="toggle-scroll" onclick={() => (preventScroll = !preventScroll)}>
      preventScroll: {String(preventScroll)}
    </button>
    <button data-testid="toggle-modal" onclick={() => (modal = !modal)}>
      modal: {String(modal)}
    </button>
    <button {...api.getTriggerProps()} data-testid="trigger">Open dialog</button>
  </div>

  <button data-testid="outside-button" style="margin-top: 16px">
    Outside button (should be reachable by Tab only when trapFocus is off)
  </button>

  <div style="height: 150vh; padding-top: 16px">Long page, so body scroll lock is observable.</div>

  {#if api.open}
    <Portal>
      <!-- hidden rather than unmounted, so the backdrop stays before the positioner -->
      <div {...api.getBackdropProps()} style:display={modal ? undefined : "none"}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()} data-testid="content">
          <h2 {...api.getTitleProps()}>Player</h2>
          <p {...api.getDescriptionProps()}>Minimizing releases focus and scroll without closing or remounting.</p>
          <Uptime />
          <input data-testid="inside-input" placeholder="Inside the dialog..." />
          <button data-testid="inside-toggle-minimized" onclick={toggleMinimized}>
            {minimized ? "Maximize" : "Minimize"}
          </button>
          <button {...api.getCloseTriggerProps()} data-testid="close">
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</main>
