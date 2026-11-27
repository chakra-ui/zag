<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Uptime from "#lib/components/dialog-uptime.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/dialog.css"

  let modal = $state<boolean | "trap-focus">("trap-focus")

  const id = $props.id()
  const service = useMachine(dialog.machine, () => ({
    id,
    defaultOpen: true,
    modal,
  }))

  const api = $derived(dialog.connect(service, normalizeProps))

  const minimized = $derived(modal === false)
  const toggleMinimized = () => (modal = minimized ? "trap-focus" : false)

  const nextModal = (value: boolean | "trap-focus") =>
    value === false ? "trap-focus" : value === "trap-focus" ? true : false
</script>

<main class="dialog">
  <div style="display: flex; gap: 8px; flex-wrap: wrap">
    <button data-testid="toggle-minimized" onclick={toggleMinimized}>
      {minimized ? "Maximize" : "Minimize"}
    </button>
    <button data-testid="toggle-modal" onclick={() => (modal = nextModal(modal))}>
      modal: {String(modal)}
    </button>
    <button {...api.getTriggerProps()} data-testid="trigger">Open dialog</button>
  </div>

  <button data-testid="outside-button" style="margin-top: 16px">
    Outside button (reachable by Tab only when modal is false)
  </button>

  <div style="height: 150vh; padding-top: 16px">Long page, so body scroll lock is observable.</div>

  {#if api.open}
    <Portal>
      <!-- hidden rather than unmounted, so the backdrop stays before the positioner -->
      <div {...api.getBackdropProps()} style:display={modal === true ? undefined : "none"}></div>
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
