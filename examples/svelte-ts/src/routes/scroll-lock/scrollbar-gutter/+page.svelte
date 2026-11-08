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
    <p class="hint">Lock scrolling and watch the header keep its width.</p>
    <button data-testid="toggle-lock" aria-pressed={locked} onclick={() => (locked = !locked)}>
      {locked ? "Unlock scrolling" : "Lock scrolling"}
    </button>
  </div>
</main>
