"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId } from "react"
import { ExampleProps } from "@/components/example-props"
import "@styles/pagination.css"

// No page list: just prev/next and where you are
const props = { count: 120 }

export default function Page() {
  const service = useMachine(pagination.machine, { id: useId(), ...props })

  const api = pagination.connect(service, normalizeProps)

  return (
    <main className="pagination">
      <div className="vstack gap-4">
        <nav {...api.getRootProps()}>
          <ul>
            <li>
              <button {...api.getPreviousTriggerProps()}>
                <ChevronLeftIcon />
                <span>Previous</span>
              </button>
            </li>
            <li className="pagination-summary" aria-live="polite">
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
        <ExampleProps value={props} />
      </div>
    </main>
  )
}
