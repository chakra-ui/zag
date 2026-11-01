import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { ExampleProps } from "~/components/example-props"
import "@styles/pagination.css"

const props = { count: 500, defaultPage: 12, siblingCount: 2 }

export default function Page() {
  const service = useMachine(pagination.machine, { id: createUniqueId(), ...props })

  const api = createMemo(() => pagination.connect(service, normalizeProps))

  return (
    <main class="pagination">
      <div class="vstack gap-4">
        <nav {...api().getRootProps()}>
          <ul>
            <li>
              <button {...api().getFirstTriggerProps()}>
                <ChevronsLeftIcon />
              </button>
            </li>
            <li>
              <button {...api().getPreviousTriggerProps()}>
                <ChevronLeftIcon />
              </button>
            </li>
            <For each={api().pages}>
              {(page, i) =>
                page.type === "page" ? (
                  <li>
                    <button {...api().getItemProps(page)}>{page.value}</button>
                  </li>
                ) : (
                  <li>
                    <span {...api().getEllipsisProps({ index: i() })}>&#8230;</span>
                  </li>
                )
              }
            </For>
            <li>
              <button {...api().getNextTriggerProps()}>
                <ChevronRightIcon />
              </button>
            </li>
            <li>
              <button {...api().getLastTriggerProps()}>
                <ChevronsRightIcon />
              </button>
            </li>
          </ul>
        </nav>
        <span class="pagination-summary">
          Page {api().page} of {api().totalPages}
        </span>
        <ExampleProps value={props} />
      </div>
    </main>
  )
}
