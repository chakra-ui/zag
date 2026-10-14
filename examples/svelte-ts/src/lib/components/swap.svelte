<script lang="ts">
  import type { Snippet } from "svelte"
  import Presence from "./presence.svelte"

  interface Props {
    open: boolean
    children: Snippet
    fallback?: Snippet
  }

  const { open, children, fallback }: Props = $props()
</script>

<Presence data-scope="swap" hidden={!open}>
  {@render children()}
</Presence>
<Presence data-scope="swap" hidden={open}>
  {@render fallback?.()}
</Presence>
