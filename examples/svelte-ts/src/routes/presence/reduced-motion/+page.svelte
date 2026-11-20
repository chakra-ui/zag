<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/presence.css"

  let present = $state(true)

  const service = useMachine(presence.machine, () => ({ present }))
  const api = $derived(presence.connect(service, normalizeProps))

  function setNode(node: HTMLDivElement) {
    api.setNode(node)
  }
</script>

<main>
  <div class="presence-reduced-motion">
    <p class="hint">With reduced motion on, the CSS drops the exit animation and the details unmount right away.</p>
    <button type="button" onclick={() => (present = !present)}>{present ? "Hide details" : "Show details"}</button>
    {#if api.present}
      <div
        {@attach setNode}
        class="details"
        data-testid="order-details"
        data-state={api.skip ? undefined : present ? "open" : "closed"}
      >
        <strong>Order #1042</strong>
        <p>2 items · Ships Thursday · Paid with Visa •••• 4242</p>
      </div>
    {/if}
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
