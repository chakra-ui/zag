"use client"

import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/react"
import { paginationData } from "@zag-js/shared"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useId } from "react"
import { ExampleProps } from "@/components/example-props"
import "@styles/pagination.css"

const pageSizes = [5, 10, 20, 50]

const props = { count: paginationData.length, defaultPageSize: 5 }

export default function Page() {
  const selectId = useId()

  const service = useMachine(pagination.machine, {
    id: useId(),
    ...props,
  })

  const api = pagination.connect(service, normalizeProps)

  // pageRange is zero-based and end-exclusive
  const { start, end } = api.pageRange

  return (
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
            {api.slice(paginationData).map((item) => (
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
          <div className="pagination-page-size">
            <label htmlFor={selectId}>Rows per page</label>
            <select id={selectId} value={api.pageSize} onChange={(e) => api.setPageSize(Number(e.target.value))}>
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="hstack gap-4">
            <span className="pagination-summary">
              {start + 1}–{end} of {api.count}
            </span>
            <nav {...api.getRootProps()}>
              <ul>
                <li>
                  <button {...api.getPrevTriggerProps()}>
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

        <ExampleProps value={props} />
      </div>
    </main>
  )
}
