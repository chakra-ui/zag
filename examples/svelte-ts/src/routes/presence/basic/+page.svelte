<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let present = $state(false)

  const service = useMachine(presence.machine, () => ({
    present,
  }))
  const api = $derived(presence.connect(service, normalizeProps))

  function setNode(node: HTMLDivElement) {
    api.setNode(node)
  }
</script>

<main class="presence">
  <button onclick={() => (present = !present)}>Toggle</button>
  {#if api.present}
    <div {@attach setNode} data-scope="presence" data-state={present ? "open" : "closed"}>Content</div>
  {/if}
</main>
