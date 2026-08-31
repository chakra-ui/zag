<script lang="ts">
  import * as infiniteScroll from "@zag-js/infinite-scroll"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import type { Snippet } from "svelte"

  interface Props {
    count: number
    hasMore: boolean
    loading: boolean
    onLoadMore: () => void
    /**
     * Wrapper for the sentinel + indicator. Use `"li"` inside a menu `<ul>`; `"div"` elsewhere.
     * @default "div"
     */
    as?: "div" | "li"
    children?: Snippet
  }

  let { count, hasMore, loading, onLoadMore, as = "div", children }: Props = $props()

  const id = $props.id()
  const service = useMachine(infiniteScroll.machine, () => ({
    id,
    count,
    hasMore,
    loading,
    onLoadMore: () => onLoadMore(),
  }))

  const api = $derived(infiniteScroll.connect(service, normalizeProps))
</script>

<svelte:element this={as} role={as === "li" ? "presentation" : undefined}>
  <div {...api.getSentinelProps()}></div>
  <div {...api.getIndicatorProps({ type: "loading" })} style="padding: 8px 12px; font-size: 13px">
    {#if children}
      {@render children()}
    {:else}
      Loading more…
    {/if}
  </div>
</svelte:element>
