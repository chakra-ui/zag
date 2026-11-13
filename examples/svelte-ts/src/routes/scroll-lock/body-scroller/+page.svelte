<script lang="ts">
  import { preventBodyScroll } from "@zag-js/remove-scroll"
  import "@styles/scroll-lock.css"

  let open = $state(false)

  $effect(() => {
    if (!open) return
    return preventBodyScroll()
  })
</script>

<main>
  <div class="body-scroller">
    <p class="hint">Open the filters, then try scrolling the page behind them.</p>
    <button onclick={() => (open = true)}>Open filters</button>

    {#if open}
      <div class="backdrop"></div>
      <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
        <span class="panel-title">Filters</span>
        <p>Narrow the results by price, brand and rating.</p>
        <button onclick={() => (open = false)}>Show 24 results</button>
      </div>
    {/if}
  </div>
</main>
