<script lang="ts">
  import ExampleProps from "$lib/components/example-props.svelte"
  import * as pagination from "@zag-js/pagination"
  import { paginationData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/pagination.css"

  const pageSizes = [5, 10, 20, 50]

  const exampleProps = { count: paginationData.length, defaultPageSize: 5 }

  const id = $props.id()
  const selectId = `${id}-page-size`

  const service = useMachine(pagination.machine, { id, ...exampleProps })

  const api = $derived(pagination.connect(service, normalizeProps))

  // pageRange is zero-based and end-exclusive
  const { start, end } = $derived(api.pageRange)
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
        {#each api.slice(paginationData) as item (item.id)}
          <tr>
            <td>{item.id}</td>
            <td>{item.first_name} {item.last_name}</td>
            <td>{item.email}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div class="pagination-bar">
      <div class="pagination-page-size">
        <label for={selectId}>Rows per page</label>
        <select id={selectId} value={api.pageSize} onchange={(e) => api.setPageSize(Number(e.currentTarget.value))}>
          {#each pageSizes as size (size)}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>

      <div class="hstack gap-4">
        <span class="pagination-summary">
          {start + 1}–{end} of {api.count}
        </span>
        <nav {...api.getRootProps()}>
          <ul>
            <li>
              <button {...api.getPreviousTriggerProps()}>
                <ChevronLeftIcon />
              </button>
            </li>
            <li>
              <button {...api.getNextTriggerProps()}>
                <ChevronRightIcon />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <ExampleProps value={exampleProps} />
  </div>
</main>
