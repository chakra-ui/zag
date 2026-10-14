<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/presence.css"

  let open = $state(true)
  let unmounted = $state(false)

  const service = useMachine(presence.machine, () => ({
    present: open,
    onExitComplete() {
      unmounted = true
    },
  }))

  const api = $derived(presence.connect(service, normalizeProps))

  function setNode(node: HTMLDivElement) {
    api.setNode(node)
  }
</script>

<main style="min-width: 400px; padding: 40px; display: flex; flex-direction: column; gap: 1rem">
  <div>
    Open: {String(open)}, Unmounted: {String(unmounted)}
  </div>
  <button
    onclick={() => {
      unmounted = false
      open = !open
    }}
  >
    Toggle
  </button>
  <!-- Kept mounted until the exit animation completes -->
  {#if api.present}
    <div
      {@attach setNode}
      data-presence-root
      hidden={!api.present}
      data-state={api.skip ? undefined : open ? "open" : "closed"}
    >
      <div>Content</div>
    </div>
  {/if}
</main>
