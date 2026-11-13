<script lang="ts">
  import { preventBodyScroll } from "@zag-js/remove-scroll"
  import "@styles/scroll-lock.css"

  const items = Array.from({ length: 30 }, (_, i) => `Result ${i + 1}`)

  let open = $state(false)
  let navHidden = $state(false)

  $effect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      navHidden = window.scrollY > lastY
      lastY = window.scrollY
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  })

  $effect(() => {
    if (!open) return
    return preventBodyScroll()
  })
</script>

<main>
  <div class="scroll-position">
    <nav class="nav" data-hidden={navHidden || undefined}>
      Store
      <button onclick={() => (open = true)}>Open filters</button>
    </nav>
    <p class="hint">Scroll down, then up until the nav shows. Open and close the filters: the nav should stay put.</p>

    {#if open}
      <div class="backdrop"></div>
      <div class="panel" role="dialog" aria-modal="true" aria-label="Filters">
        <span class="panel-title">Filters</span>
        <div class="list">
          {#each items as item (item)}
            <p>{item}</p>
          {/each}
        </div>
        <button onclick={() => (open = false)}>Show results</button>
      </div>
    {/if}
  </div>
</main>
