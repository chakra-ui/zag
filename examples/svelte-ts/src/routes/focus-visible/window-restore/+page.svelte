<script lang="ts">
  import { isFocusRestoredByWindow, trackFocusVisible } from "@zag-js/focus-visible"
  import { onMount } from "svelte"
  import "@styles/focus-visible.css"

  const recentSearches = ["Controlled state", "Positioning", "Form integration"]

  let query = $state("")
  let open = $state(false)
  let lastFocus = $state("Not focused yet")

  onMount(() => trackFocusVisible())

  function onfocus() {
    const restored = isFocusRestoredByWindow()
    lastFocus = restored ? "Restored by the window" : "Moved by you"
    if (!restored) open = true
  }

  function onfocusout(event: FocusEvent & { currentTarget: HTMLElement }) {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    open = false
  }
</script>

<main>
  <div class="focus-visible-window-restore">
    <p class="hint">Switch tabs and come back</p>
    <div class="search" {onfocusout}>
      <input type="search" aria-label="Search docs" placeholder="Search docs" bind:value={query} {onfocus} />
      {#if open}
        <ul class="recent" aria-label="Recent searches">
          {#each recentSearches as search (search)}
            <li>
              <button type="button" onmousedown={(event) => event.preventDefault()} onclick={() => (query = search)}>
                {search}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <p class="status">
      Last focus: <span>{lastFocus}</span>
    </p>
  </div>
</main>
