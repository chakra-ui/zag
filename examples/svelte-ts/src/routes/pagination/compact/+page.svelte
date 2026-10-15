<script lang="ts">
  import ExampleProps from "$lib/components/example-props.svelte"
  import * as pagination from "@zag-js/pagination"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronLeftIcon, ChevronRightIcon } from "lucide-svelte"
  import "@styles/pagination.css"

  // No page list: just prev/next and where you are
  const exampleProps = { count: 120 }

  const id = $props.id()
  const service = useMachine(pagination.machine, { id, ...exampleProps })

  const api = $derived(pagination.connect(service, normalizeProps))
</script>

<main class="pagination">
  <div class="vstack gap-4">
    <nav {...api.getRootProps()}>
      <ul>
        <li>
          <button {...api.getPreviousTriggerProps()}>
            <ChevronLeftIcon />
            <span>Previous</span>
          </button>
        </li>
        <li class="pagination-summary" aria-live="polite">
          Page {api.page} of {api.totalPages}
        </li>
        <li>
          <button {...api.getNextTriggerProps()}>
            <span>Next</span>
            <ChevronRightIcon />
          </button>
        </li>
      </ul>
    </nav>
    <ExampleProps value={exampleProps} />
  </div>
</main>
