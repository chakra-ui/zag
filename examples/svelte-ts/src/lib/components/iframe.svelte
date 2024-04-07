<script lang="ts">
  import { portal } from "@zag-js/svelte"
  import { onMount } from "svelte"

  let frameRef: HTMLIFrameElement | null = null
  let mountNode = $state<HTMLElement | undefined>()

  onMount(() => {
    if (!frameRef) return
    mountNode = frameRef.contentWindow?.document.body
  })
</script>

<iframe title="iframe" bind:this={frameRef}>
  {#if mountNode}
    <span use:portal={{ container: mountNode }}>
      <slot />
    </span>
  {/if}
</iframe>
