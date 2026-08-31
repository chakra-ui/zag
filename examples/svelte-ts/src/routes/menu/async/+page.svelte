<script lang="ts">
  import * as asyncList from "@zag-js/async-list"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import LoadMore from "$lib/components/load-more.svelte"
  import "@styles/menu.css"

  interface Character {
    name: string
  }

  let hasOpened = false

  const listService = useMachine(asyncList.machine as asyncList.Machine<Character>, {
    autoReload: false,
    async load({ signal, cursor }) {
      if (cursor) cursor = cursor.replace(/^http:\/\//i, "https://")
      await new Promise((resolve) => setTimeout(resolve, 400))
      const res = await fetch(cursor || "https://swapi.py4e.com/api/people/", { signal })
      const json = await res.json()
      return { items: json.results, cursor: json.next ?? undefined }
    },
  })
  const listApi = $derived(asyncList.connect(listService))

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    onSelect: console.log,
    onOpenChange({ open }) {
      if (open && !hasOpened) {
        hasOpened = true
        listApi.reload()
      }
    },
  })

  const api = $derived(menu.connect(service, normalizeProps))

  const isInitialLoading = $derived(listApi.isLoading && listApi.items.length === 0)
</script>

<main style="padding: 40px">
  <p style="margin-bottom: 16px; color: #666">
    Opens empty, loads SWAPI people on first open, then fetches the next page when you scroll to the bottom.
  </p>
  <div>
    <button {...api.getTriggerProps()}>
      Characters <span {...api.getIndicatorProps()}>▾</span>
    </button>
    {#if api.open}
      <div use:portal {...api.getPositionerProps()}>
        <ul
          {...mergeProps(api.getContentProps(), {
            "aria-label": "Characters",
            style: "max-height: 240px; overflow-y: auto; width: 220px",
          })}
        >
          {#if isInitialLoading}
            <li style="padding: 8px 6px; font-size: 13px">
              <output aria-live="polite">Loading…</output>
            </li>
          {/if}
          {#if listApi.error}
            <li style="padding: 8px 6px; font-size: 13px">
              <output>Couldn't load characters</output>
            </li>
          {/if}
          {#if !isInitialLoading && listApi.isEmpty && !listApi.error}
            <li style="padding: 8px 6px; font-size: 13px">
              <output>No characters found</output>
            </li>
          {/if}
          {#each listApi.items as item (item.name)}
            <li {...api.getItemProps({ value: item.name, valueText: item.name })}>{item.name}</li>
          {/each}
          {#if !isInitialLoading}
            <LoadMore
              as="li"
              count={listApi.items.length}
              hasMore={listApi.hasMore}
              loading={listApi.isLoading}
              onLoadMore={() => listApi.loadMore()}
            />
          {/if}
        </ul>
      </div>
    {/if}
  </div>
</main>
