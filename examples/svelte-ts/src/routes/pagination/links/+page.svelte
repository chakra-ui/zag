<script lang="ts">
  import { page as currentPage } from "$app/state"
  import ExampleProps from "$lib/components/example-props.svelte"
  import * as pagination from "@zag-js/pagination"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/pagination.css"

  // Pages render as links; the URL is the source of truth
  const page = $derived(Number(currentPage.url.searchParams.get("page") ?? 1))

  const exampleProps = $derived({
    count: 200,
    type: "link",
    page,
    getPageUrl: ({ page }: pagination.PageUrlDetails) => `?page=${page}`,
  } as const)

  const id = $props.id()
  const service = useMachine(pagination.machine, () => ({ id, ...exampleProps }))

  const api = $derived(pagination.connect(service, normalizeProps))
</script>

<main class="pagination">
  <div class="vstack gap-4">
    <nav {...api.getRootProps()}>
      <ul>
        <li>
          <a {...api.getPrevTriggerProps()}>
            <ChevronLeftIcon />
          </a>
        </li>
        {#each api.pages as item, i (item.type === "page" ? item.value : `ellipsis-${i}`)}
          {#if item.type === "page"}
            <li>
              <a {...api.getItemProps(item)}>{item.value}</a>
            </li>
          {:else}
            <li>
              <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
            </li>
          {/if}
        {/each}
        <li>
          <a {...api.getNextTriggerProps()}>
            <ChevronRightIcon />
          </a>
        </li>
      </ul>
    </nav>
    <span class="pagination-summary">
      Page {api.page} of {api.totalPages} · URL <code>{api.getPageUrl(api.page)}</code>
    </span>
    <ExampleProps value={exampleProps} />
  </div>
</main>
