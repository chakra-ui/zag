<script lang="ts">
  import { preventBodyScroll } from "@zag-js/remove-scroll"
  import "@styles/scroll-lock.css"

  let locked = $state(false)

  $effect(() => {
    if (!locked) return
    return preventBodyScroll()
  })
</script>

<main>
  <div class="scrollbar-gutter">
    <div class="header" data-testid="header">Northwind Design</div>
    <p class="hint">The page reserves its scrollbar gutter. Lock scrolling and the header stays the same width.</p>
    <button data-testid="toggle-lock" aria-pressed={locked} onclick={() => (locked = !locked)}>
      {locked ? "Unlock scrolling" : "Lock scrolling"}
    </button>
  </div>
</main>
