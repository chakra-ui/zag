<script lang="ts">
  import * as collapsible from "@zag-js/collapsible"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/collapsible.css"

  let open = $state(true)

  const id = $props.id()
  const service = useMachine(collapsible.machine, () => ({
    id,
    open,
    onOpenChange: (details) => (open = details.open),
  }))

  const api = $derived(collapsible.connect(service, normalizeProps))
</script>

<main class="collapsible">
  <h1>Collapsible Controlled</h1>
  <h1>{String(open)}</h1>

  <div style="display: flex; gap: 12px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>
  </div>

  <div {...api.getRootProps()}>
    <div {...api.getContentProps()}>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. <a href="#">Some Link</a>
      </p>
    </div>
  </div>
</main>
