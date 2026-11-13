<script lang="ts">
  import { preventBodyScroll } from "@zag-js/remove-scroll"
  import "@styles/scroll-lock.css"

  let sheetOpen = $state(false)
  let confirmOpen = $state(false)

  $effect(() => {
    if (!sheetOpen) return
    return preventBodyScroll()
  })

  $effect(() => {
    if (!confirmOpen) return
    return preventBodyScroll()
  })

  const closeSheet = () => {
    confirmOpen = false
    sheetOpen = false
  }
</script>

<main>
  <div class="nested">
    <p class="hint">
      Open the settings, then the confirmation, and close the confirmation to see the page stay locked.
    </p>
    <button data-testid="open-sheet" onclick={() => (sheetOpen = true)}>Open settings</button>

    {#if sheetOpen}
      <div class="backdrop"></div>
      <div class="panel sheet" role="dialog" aria-modal="true" aria-label="Workspace settings" data-testid="sheet">
        <span class="panel-title">Workspace settings</span>
        <p>Rename the workspace, invite teammates or remove it for good.</p>
        <div class="row">
          <button data-testid="open-confirm" onclick={() => (confirmOpen = true)}>Delete workspace</button>
          <button data-testid="close-sheet" onclick={closeSheet}>Close</button>
        </div>
      </div>
    {/if}

    {#if confirmOpen}
      <div class="backdrop" data-layer="confirm"></div>
      <div
        class="panel confirm"
        role="alertdialog"
        aria-modal="true"
        aria-label="Delete workspace?"
        data-testid="confirm"
      >
        <span class="panel-title">Delete workspace?</span>
        <p>All projects in Northwind Design will be removed.</p>
        <div class="row">
          <button data-testid="close-confirm" onclick={() => (confirmOpen = false)}>Keep workspace</button>
        </div>
      </div>
    {/if}
  </div>
</main>
