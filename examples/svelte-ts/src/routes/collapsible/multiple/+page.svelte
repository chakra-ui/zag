<script lang="ts">
  import CollapsibleMultipleItem from "$lib/components/collapsible-multiple-item.svelte"
  import "@styles/collapsible.css"

  let list = $state([1, 2, 3])
  let open = $state(true)
</script>

<main>
  <div style="display: flex; gap: 10px">
    {#each list as value (value)}
      <CollapsibleMultipleItem {value} {open} />
    {/each}
  </div>
  <pre>list:{list.toString()}; open: {open.toString()}</pre>

  <div>
    <button onclick={() => (list = [...list].reverse())}>reverse</button>
    <button onclick={() => (open = !open)}>toggle collapse</button>
  </div>
</main>
