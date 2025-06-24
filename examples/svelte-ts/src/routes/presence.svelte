<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let present = $state(false)
  let ref: HTMLDivElement | null = $state(null)

  const service = useMachine(presence.machine, {
    get present() {
      return present
    },
  })
  const api = $derived(presence.connect(service, normalizeProps))

  $effect(() => {
    if (ref) {
      api.setNode(ref)
    }
  })
</script>

<main class="presence">
  <button onclick={() => (present = !present)}>Toggle</button>
  {#if api.present}
    <div bind:this={ref} data-scope="presence" data-state={present ? "open" : "closed"}>Content</div>
  {/if}
</main>
