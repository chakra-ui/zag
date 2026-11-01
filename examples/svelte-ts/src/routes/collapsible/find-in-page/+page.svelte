<script lang="ts">
  import * as collapsible from "@zag-js/collapsible"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronDownIcon } from "lucide-svelte"
  import "@styles/collapsible.css"

  const id = $props.id()
  const service = useMachine(collapsible.machine, { id, hiddenUntilFound: true })
  const api = $derived(collapsible.connect(service, normalizeProps))
</script>

<main class="collapsible">
  <p>Search the page for “keyboard” to open the changelog.</p>
  <div {...api.getRootProps()}>
    <button {...api.getTriggerProps()}>
      Full changelog
      <div {...api.getIndicatorProps()}><ChevronDownIcon /></div>
    </button>
    <div {...api.getContentProps()}>
      <ul>
        <li>Added keyboard support for reordering items.</li>
        <li>Fixed focus returning to the trigger after closing.</li>
        <li>Improved the open animation on slower devices.</li>
      </ul>
    </div>
  </div>
</main>
