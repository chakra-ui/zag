"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { paginationControls, paginationData } from "@zag-js/shared"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId, useState } from "react"
import { Print } from "@/components/print"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/pagination.css"

export default function Page() {
  const controls = useControls(paginationControls)
  const [details, setDetails] = useState({} as any)

  const service = useMachine(pagination.machine, {
    id: useId(),
    count: paginationData.length,
    onPageChange(details) {
      setDetails(details)
    },
    ...controls.context,
  })

  const api = pagination.connect(service, normalizeProps)

  const data = api.slice(paginationData)

  return (
    <>
      <main className="pagination">
        <div className="pagination-layout">
          <table className="pagination-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.email}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-bar">
            <span className="pagination-summary">
              {api.pageRange.start + 1}–{api.pageRange.end} of {api.count}
            </span>
            {api.totalPages > 1 && (
              <nav {...api.getRootProps()}>
                <ul>
                  <li>
                    <button {...api.getPrevTriggerProps()}>
                      <ChevronLeftIcon />
                    </button>
                  </li>
                  {api.pages.map((page, i) =>
                    page.type === "page" ? (
                      <li key={page.value}>
                        <button data-testid={`item-${page.value}`} {...api.getItemProps(page)}>
                          {page.value}
                        </button>
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
                </ul>
              </nav>
            )}
          </div>

          <Print title="Page change details" value={details} />
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
