<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as gridlist from "@zag-js/gridlist"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon } from "lucide-svelte"
  import { useInfiniteScroll } from "$lib/use-infinite-scroll.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/gridlist.css"

  interface Pokemon {
    name: string
    url: string
  }

  const listService = useMachine(asyncList.machine as asyncList.Machine<Pokemon>, {
    autoReload: true,
    async load({ signal, cursor }) {
      const url = cursor ?? "https://pokeapi.co/api/v2/pokemon?limit=20"
      const res = await fetch(url, { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })
  const listApi = $derived(asyncList.connect(listService))

  const id = $props.id()

  const scrollApi = useInfiniteScroll(() => ({
    id: `${id}-scroll`,
    count: listApi.items.length,
    hasMore: listApi.hasMore,
    loading: listApi.isLoading,
    onLoadMore: () => listApi.loadMore(),
  }))

  const collection = $derived(
    gridlist.collection<Pokemon>({
      items: listApi.items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const service = useMachine(gridlist.machine as gridlist.Machine<Pokemon>, () => ({
    id,
    collection,
    selectionMode: "single" as const,
  }))

  const api = $derived(gridlist.connect(service, normalizeProps))

  const isInitialLoading = $derived(listApi.isLoading && listApi.items.length === 0)
  const isLoadingMore = $derived(listApi.isLoading && listApi.items.length > 0)
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Pokemon ({listApi.items.length} loaded)</label>
      <div {...api.getContentProps()}>
        {#if isInitialLoading}
          <div role="status" aria-live="polite" style="padding: 12px 14px; color: #71717a">Loading…</div>
        {/if}

        {#each listApi.items as item (item.name)}
          <div {...api.getItemProps({ item, focusOnHover: true })}>
            <div {...api.getCellProps()}>
              {#if api.hasCheckbox}
                <button {...api.getItemCheckboxProps({ item })}>
                  <CheckIcon {...api.getItemIndicatorProps({ item }) as Record<string, unknown>} />
                </button>
              {/if}
              <div class="gridlist-item-body">
                <span {...api.getItemTextProps({ item })} class="gridlist-item-title">
                  {item.name}
                </span>
                <span class="gridlist-item-description">{item.url}</span>
              </div>
            </div>
          </div>
        {/each}

        <div {...scrollApi().getSentinelProps()}></div>

        {#if isLoadingMore}
          <div role="status" aria-live="polite" style="padding: 12px 14px; color: #71717a">Loading more…</div>
        {/if}

        {#if !listApi.hasMore && !listApi.isLoading && listApi.items.length > 0}
          <div role="status" aria-live="polite" style="padding: 12px 14px; color: #a1a1aa">End of list</div>
        {/if}
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Selected: <strong>{api.valueAsString || "none"}</strong>
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["focusedValue", "value"]} />
</Toolbar>
