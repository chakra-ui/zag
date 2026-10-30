<script lang="ts">
  import ExampleProps from "#lib/components/example-props.svelte"
  import * as pagination from "@zag-js/pagination"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-svelte"
  import "@styles/pagination.css"

  const exampleProps = { count: 500, defaultPage: 12, siblingCount: 2 }

  const id = $props.id()
  const service = useMachine(pagination.machine, { id, ...exampleProps })

  const api = $derived(pagination.connect(service, normalizeProps))
</script>

<main class="pagination">
  <div class="vstack gap-4">
    <nav {...api.getRootProps()}>
      <ul>
        <li>
          <button {...api.getFirstTriggerProps()}>
            <ChevronsLeftIcon />
          </button>
        </li>
        <li>
          <button {...api.getPreviousTriggerProps()}>
            <ChevronLeftIcon />
          </button>
        </li>
        {#each api.pages as page, i (page.type === "page" ? page.value : `ellipsis-${i}`)}
          {#if page.type === "page"}
            <li>
              <button {...api.getItemProps(page)}>{page.value}</button>
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
        <li>
          <button {...api.getLastTriggerProps()}>
            <ChevronsRightIcon />
          </button>
        </li>
      </ul>
    </nav>
    <span class="pagination-summary">
      Page {api.page} of {api.totalPages}
    </span>
    <ExampleProps value={exampleProps} />
  </div>
</main>
