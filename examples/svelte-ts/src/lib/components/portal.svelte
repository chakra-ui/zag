<script lang="ts">
  import type { Snippet } from "svelte"
  import { getAllContexts, mount, unmount } from "svelte"

  interface Props {
    disabled?: boolean
    container?: HTMLElement
    children: Snippet
  }

  let { disabled = false, container = globalThis?.document?.body, children }: Props = $props()

  const context = getAllContexts()

  $effect(() => {
    if (disabled || !container) return
    const instance = mount(children, { target: container, context })
    return () => unmount(instance)
  })
</script>

{#if disabled || !container}
  {@render children()}
{/if}
