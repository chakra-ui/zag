<script lang="ts">
  import { trackDismissableElement } from "@zag-js/dismissable"
  import "@styles/dismissable.css"

  const sortOptions = ["Newest", "Price: low to high", "Rating"]

  let open = $state(false)
  let sort = $state(sortOptions[0])

  let triggerRef = $state<HTMLButtonElement>()
  let panelRef = $state<HTMLDivElement>()
  let toolbarRef = $state<HTMLDivElement>()

  $effect(() => {
    if (!open || !panelRef || !triggerRef || !toolbarRef) return
    return trackDismissableElement(panelRef, {
      exclude: [triggerRef, toolbarRef],
      onLayerChange: () => {},
      onDismiss: () => (open = false),
    })
  })
</script>

<main>
  <div class="exclude">
    <div bind:this={toolbarRef} role="toolbar" aria-label="Sort results" data-testid="toolbar" class="sort-bar">
      {#each sortOptions as option (option)}
        <button aria-pressed={sort === option} onclick={() => (sort = option)}>{option}</button>
      {/each}
    </div>

    <button bind:this={triggerRef} data-testid="trigger" onclick={() => (open = !open)}>Filters</button>

    <div bind:this={panelRef} hidden={!open} role="dialog" aria-label="Filters" data-testid="panel" class="panel">
      <strong>Filter running shoes</strong>
      <label><input type="checkbox" /> In stock</label>
      <label><input type="checkbox" /> Free delivery</label>
    </div>

    <p role="status" data-testid="status" class="status">Sorted by {sort}</p>
    <p data-testid="outside">Showing 24 results. Click here to close the filters.</p>
  </div>
</main>
