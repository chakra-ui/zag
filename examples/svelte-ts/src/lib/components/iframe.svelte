<script lang="ts">
  import { portal } from "@zag-js/svelte"
  import { onMount, type Snippet } from "svelte"

  let frameRef: HTMLIFrameElement | null = null
  let mountNode = $state<HTMLElement | undefined>()
  let { children }: { children: Snippet } = $props()

  onMount(() => {
    if (!frameRef) return
    mountNode = frameRef.contentWindow?.document.body
  })
</script>

<iframe title="iframe" bind:this={frameRef}>
  {#if mountNode}
    <span use:portal={{ container: mountNode }}>
      {@render children()}
    </span>
  {/if}
</iframe>
