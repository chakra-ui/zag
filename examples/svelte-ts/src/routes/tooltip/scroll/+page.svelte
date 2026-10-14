<script lang="ts">
  import Tooltip from "$lib/components/tooltip-scroll-item.svelte"
  import "@styles/tooltip.css"
</script>

<main>
  <div class="root">
    <h2>Tooltip Scroll Hover Test</h2>
    <p>Hover over items, then scroll to see tooltips appear when cursor lands on items</p>
    <div style="height: 400px; overflow: auto; border: 1px solid #ccc; padding: 10px; margin-top: 20px">
      {#each Array.from({ length: 100 }) as _, idx (idx)}
        <div style="padding: 10px; border-bottom: 1px solid #eee">
          <Tooltip closeOnPointerDown={true}>item {idx}</Tooltip>
        </div>
      {/each}
    </div>
  </div>
</main>
