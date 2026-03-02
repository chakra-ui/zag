<script lang="ts">
  import { getPlacement, getPlacementStyles } from "@zag-js/popper"
  import { onMount } from "svelte"
  import { normalizeProps } from "@zag-js/svelte"

  let referenceRef: HTMLButtonElement
  let floatingRef: HTMLDivElement
  let positioned = $state.raw<any>({})

  onMount(() => {
    if (!referenceRef || !floatingRef) return
    return getPlacement(referenceRef, floatingRef, {
      placement: "right-start",
      onComplete(data) {
        positioned = data
      },
    })
  })

  const styles = $derived.by(() => {
    const floatingStyle = getPlacementStyles(positioned).floating
    return normalizeProps.style(floatingStyle)
  })

  $inspect(styles)
</script>

<main>
  <button bind:this={referenceRef}>Hello StackBlitz!</button>
  <div style={styles} bind:this={floatingRef}>Start editing to see some magic happen :)</div>
</main>
