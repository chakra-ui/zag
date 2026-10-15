"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react"
import { useId } from "react"
import { ExampleProps } from "@/components/example-props"
import "@styles/pagination.css"

const props = { count: 500, defaultPage: 12, siblingCount: 2 }

export default function Page() {
  const service = useMachine(pagination.machine, { id: useId(), ...props })

  const api = pagination.connect(service, normalizeProps)

  return (
    <main className="pagination">
      <div className="vstack gap-4">
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
            {api.pages.map((page, i) =>
              page.type === "page" ? (
                <li key={page.value}>
                  <button {...api.getItemProps(page)}>{page.value}</button>
                </li>
              ) : (
                <li key={`ellipsis-${i}`}>
                  <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
                </li>
              ),
            )}
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
        <span className="pagination-summary">
          Page {api.page} of {api.totalPages}
        </span>
        <ExampleProps value={props} />
      </div>
    </main>
  )
}
