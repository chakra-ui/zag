<script lang="ts">
  import { getPlacement, getPlacementStyles } from "@zag-js/popper"
  import { normalizeProps } from "@zag-js/svelte"
  import { onMount } from "svelte"

  let referenceRef: HTMLButtonElement
  let floatingRef: HTMLDivElement
  let positioned = $state.raw({})

  onMount(() => {
    if (!referenceRef || !floatingRef) return
    return getPlacement(referenceRef, floatingRef, {
      placement: "right-start",
      onComplete(data) {
        positioned = data
      },
    })
  })

  const styles = $derived(getPlacementStyles(positioned))
</script>

<div>
  <button bind:this={referenceRef}>Hello StackBlitz!</button>
  <div {...normalizeProps.element({ style: styles.floating })} bind:this={floatingRef}>
    Start editing to see some magic happen :)
  </div>
</div>
