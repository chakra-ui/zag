<script lang="ts">
  import LoadMore from "$lib/components/load-more.svelte"
  import Portal from "$lib/components/portal.svelte"
  import * as asyncList from "@zag-js/async-list"
  import * as select from "@zag-js/select"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon, XIcon } from "lucide-svelte"
  import "@styles/select.css"

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

  const collection = $derived(
    select.collection({
      items: listApi.items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Pokemon>, () => ({ id, collection }))
  const api = $derived(select.connect(service, normalizeProps))

  const isInitialLoading = $derived(listApi.isLoading && listApi.items.length === 0)
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Pokemon</label>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select a Pokemon"}</span>
      </button>
      <div class="select-indicator-group">
        <button {...api.getClearTriggerProps()}>
          <XIcon />
        </button>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </div>
    </div>

    {#if api.open}
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            {#if isInitialLoading}
              <div role="status" aria-live="polite" style="padding: 8px 12px">Loading...</div>
            {/if}

            <div {...api.getListProps()}>
              {#each listApi.items as item (item.name)}
                <div {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.name}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              {/each}

              <LoadMore
                count={listApi.items.length}
                hasMore={listApi.hasMore}
                loading={listApi.isLoading}
                onLoadMore={() => listApi.loadMore()}
              >
                Loading more...
              </LoadMore>
            </div>
          </div>
        </div>
      </Portal>
    {/if}
  </div>
</main>
