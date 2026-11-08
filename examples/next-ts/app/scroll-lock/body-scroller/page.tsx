"use client"

import { preventBodyScroll } from "@zag-js/remove-scroll"
import { useEffect, useState } from "react"
import "@styles/scroll-lock.css"

export default function Page() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    return preventBodyScroll()
  }, [open])

  return (
    <main>
      <div className="body-scroller">
        <p className="hint">Scroll the page, then open the filters and try again. The lock lands on body.</p>
        <button data-testid="open-panel" onClick={() => setOpen(true)}>
          Open filters
        </button>

        {open && (
          <>
            <div className="backdrop" />
            <div className="panel" role="dialog" aria-modal="true" aria-label="Filters" data-testid="panel">
              <span className="panel-title">Filters</span>
              <p>Narrow the results by price, brand and rating.</p>
              <button data-testid="close-panel" onClick={() => setOpen(false)}>
                Show 24 results
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
