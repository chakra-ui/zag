import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import { ExampleProps } from "~/components/example-props"
import "@styles/pagination.css"

// No page list: just prev/next and where you are
const props = { count: 120 }

export default function Page() {
  const service = useMachine(pagination.machine, { id: createUniqueId(), ...props })

  const api = createMemo(() => pagination.connect(service, normalizeProps))

  return (
    <main class="pagination">
      <div class="vstack gap-4">
        <nav {...api().getRootProps()}>
          <ul>
            <li>
              <button {...api().getPreviousTriggerProps()}>
                <ChevronLeftIcon />
                <span>Previous</span>
              </button>
            </li>
            <li class="pagination-summary" aria-live="polite">
              Page {api().page} of {api().totalPages}
            </li>
            <li>
              <button {...api().getNextTriggerProps()}>
                <span>Next</span>
                <ChevronRightIcon />
              </button>
            </li>
          </ul>
        </nav>
        <ExampleProps value={props} />
      </div>
    </main>
  )
}
