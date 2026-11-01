<script lang="ts">
  import Output from "#lib/components/output.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as pagination from "@zag-js/pagination"
  import { paginationControls, paginationData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/pagination.css"

  const controls = useControls(paginationControls)
  let details = $state<any>({})

  const id = $props.id()
  const service = useMachine(
    pagination.machine,
    controls.mergeProps<pagination.Props>({
      id,
      count: paginationData.length,
      onPageChange(v) {
        details = v
      },
    }),
  )

  const api = $derived(pagination.connect(service, normalizeProps))

  const data = $derived(api.slice(paginationData))
</script>

<main class="pagination">
  <div class="pagination-layout">
    <table class="pagination-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        {#each data as item (item.id)}
          <tr>
            <td>{item.id}</td>
            <td>{item.first_name} {item.last_name}</td>
            <td>{item.email}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="pagination-bar">
      <span class="pagination-summary">
        {api.pageRange.start + 1}–{api.pageRange.end} of {api.count}
      </span>
      {#if api.totalPages > 1}
        <nav {...api.getRootProps()}>
          <ul>
            <li>
              <button {...api.getPreviousTriggerProps()}>
                <ChevronLeftIcon />
              </button>
            </li>
            {#each api.pages as page, i (page.type === "page" ? page.value : `ellipsis-${i}`)}
              {#if page.type === "page"}
                <li>
                  <button data-testid={`item-${page.value}`} {...api.getItemProps(page)}>
                    {page.value}
                  </button>
                </li>
              {:else}
                <li>
                  <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
                </li>
              {/if}
            {/each}
            <li>
              <button {...api.getNextTriggerProps()}>
                <ChevronRightIcon />
              </button>
            </li>
          </ul>
        </nav>
      {/if}
    </div>

    <Output label="Page change details" value={details} data-testid="output" />
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
