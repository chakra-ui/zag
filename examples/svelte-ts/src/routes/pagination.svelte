<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as pagination from "@zag-js/pagination"
  import { paginationControls, paginationData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(paginationControls)
  let details = $state<any>({})

  const [snapshot, send] = useMachine(
    pagination.machine({
      id: "1",
      count: paginationData.length,
      onPageChange(v) {
        details = v
      },
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(pagination.connect(snapshot, send, normalizeProps))

  const data = $derived(api.slice(paginationData))
</script>

<main class="pagination">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>FIRST NAME</th>
        <th>LAST NAME</th>
        <th>EMAIL</th>
        <th>PHONE</th>
      </tr>
    </thead>
    <tbody>
      {#each data as item}
        <tr>
          <td>{item.id}</td>
          <td>{item.first_name}</td>
          <td>{item.last_name}</td>
          <td>{item.email}</td>
          <td>{item.phone}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if api.totalPages > 1}
    <nav {...api.getRootProps()}>
      <ul>
        <li>
          <button {...api.getPrevTriggerProps()}>
            Previous <span class="sr-only">Page</span>
          </button>
        </li>
        {#each api.pages as page, i}
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
            Next <span class="sr-only">Page</span>
          </button>
        </li>
      </ul>
    </nav>
  {/if}
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
