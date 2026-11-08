<script lang="ts">
  import { getPlacement, getPlacementStyles } from "@zag-js/popper"
  import { normalizeProps } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/popper.css"

  const styles = getPlacementStyles({ placement: "top", strategy: "fixed" })

  let paragraphRef: HTMLParagraphElement
  let toolbarRef: HTMLDivElement
  let open = $state(false)
  let status = $state("")

  onMount(() => {
    const paragraph = paragraphRef
    const toolbar = toolbarRef
    if (!paragraph || !toolbar) return

    let stop: VoidFunction | undefined

    const close = () => {
      stop?.()
      stop = undefined
      open = false
    }

    const onSelectionChange = () => {
      const selection = document.getSelection()
      const inside =
        selection &&
        !selection.isCollapsed &&
        selection.rangeCount > 0 &&
        paragraph.contains(selection.anchorNode) &&
        paragraph.contains(selection.focusNode)
      if (!inside) return close()

      const range = selection.getRangeAt(0).cloneRange()
      stop?.()
      open = true
      stop = getPlacement(null, toolbar, {
        placement: "top",
        strategy: "fixed",
        gutter: 14,
        getAnchorElement: () => ({
          contextElement: paragraph,
          getBoundingClientRect: () => range.getBoundingClientRect(),
        }),
      })
    }

    document.addEventListener("selectionchange", onSelectionChange)
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange)
      stop?.()
    }
  })
</script>

<main>
  <div class="popper-selection">
    <p class="hint">Select any words to open the toolbar above them.</p>
    <p class="article" bind:this={paragraphRef} data-testid="paragraph">
      Zag state machines keep interaction logic out of your components. Each machine describes the states a widget can
      be in, the events that move it between them, and the effects it runs along the way, so the same behavior works in
      every framework.
    </p>
    <div
      class="format-bar"
      bind:this={toolbarRef}
      role="toolbar"
      tabindex="-1"
      aria-label="Text formatting"
      data-testid="selection-toolbar"
      data-open={open ? "true" : "false"}
      {...normalizeProps.element({ style: styles.floating })}
      onmousedown={(e) => e.preventDefault()}
    >
      {#each ["Bold", "Link", "Comment"] as label (label)}
        <button type="button" onclick={() => (status = `${label} applied`)}>{label}</button>
      {/each}
    </div>
    <p class="status" role="status">{status}</p>
  </div>
</main>
