<script lang="ts">
  import { getInlineRectCoords, getPlacement, getPlacementStyles, inline, type InlineRectCoords } from "@zag-js/popper"
  import { normalizeProps } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/popper.css"

  const styles = getPlacementStyles({ placement: "top" })

  let termRef: HTMLAnchorElement
  let cardRef: HTMLDivElement
  let open = $state(false)

  onMount(() => {
    const term = termRef
    const card = cardRef
    if (!term || !card) return

    let stop: VoidFunction | undefined
    let coords: InlineRectCoords | undefined

    const onPointerDown = (e: PointerEvent) => {
      if (!term.contains(e.target as Node) && !card.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    function close() {
      stop?.()
      stop = undefined
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      open = false
    }

    const onClick = (e: MouseEvent) => {
      e.preventDefault()
      coords = getInlineRectCoords({ element: term, x: e.clientX, y: e.clientY })
      stop?.()
      document.addEventListener("pointerdown", onPointerDown)
      document.addEventListener("keydown", onKeyDown)
      open = true
      stop = getPlacement(term, card, {
        placement: "top",
        gutter: 12,
        middleware: [inline({ getCoords: () => coords })],
      })
    }

    term.addEventListener("click", onClick)
    return () => {
      term.removeEventListener("click", onClick)
      close()
    }
  })
</script>

<main>
  <div class="popper-inline">
    <p class="hint">Click either line of the link to anchor the card to that line.</p>
    <p class="article">
      Every plan includes a free trial, and annual subscriptions are
      <a href="#refund-policy" class="term" bind:this={termRef} data-testid="inline-term" aria-describedby="refund-card"
        >eligible for a full refund within 30 days of purchase</a
      >
      if the product is not a fit.
    </p>
    <div
      class="card"
      id="refund-card"
      bind:this={cardRef}
      role="tooltip"
      data-testid="inline-card"
      data-open={open ? "true" : "false"}
      {...normalizeProps.element({ style: styles.floating })}
    >
      Refunded to your original payment method.
    </div>
  </div>
</main>
