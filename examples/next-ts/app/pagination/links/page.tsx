"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense, useId } from "react"
import { ExampleProps } from "@/components/example-props"
import "@styles/pagination.css"

// Pages render as links; the URL is the source of truth
function Links() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get("page") ?? 1)

  const props = {
    count: 200,
    type: "link",
    page,
    getPageUrl: ({ page }: pagination.PageUrlDetails) => `?page=${page}`,
  } as const

  const service = useMachine(pagination.machine, { id: useId(), ...props })

  const api = pagination.connect(service, normalizeProps)

  return (
    <div className="vstack gap-4">
      <nav {...api.getRootProps()}>
        <ul>
          <li>
            <a {...api.getPreviousTriggerProps()}>
              <ChevronLeftIcon />
            </a>
          </li>
          {api.pages.map((page, i) =>
            page.type === "page" ? (
              <li key={page.value}>
                <a {...api.getItemProps(page)}>{page.value}</a>
              </li>
            ) : (
              <li key={`ellipsis-${i}`}>
                <span {...api.getEllipsisProps({ index: i })}>&#8230;</span>
              </li>
            ),
          )}
          <li>
            <a {...api.getNextTriggerProps()}>
              <ChevronRightIcon />
            </a>
          </li>
        </ul>
      </nav>
      <span className="pagination-summary">
        Page {api.page} of {api.totalPages} · URL <code>{api.getPageUrl(api.page)}</code>
      </span>
      <ExampleProps value={props} />
    </div>
  )
}

export default function Page() {
  return (
    <main className="pagination">
      <Suspense>
        <Links />
      </Suspense>
    </main>
  )
}
