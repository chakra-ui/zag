"use client"

import { trackDismissableElement } from "@zag-js/dismissable"
import { useEffect, useRef, useState } from "react"
import "@styles/dismissable.css"

const sortOptions = ["Newest", "Price: low to high", "Rating"]

export default function Page() {
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState(sortOptions[0])

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    return trackDismissableElement(panelRef.current, {
      exclude: [triggerRef.current, toolbarRef.current],
      onLayerChange: () => {},
      onDismiss: () => setOpen(false),
    })
  }, [open])

  return (
    <main>
      <div className="exclude">
        <div ref={toolbarRef} role="toolbar" aria-label="Sort results" className="sort-bar">
          {sortOptions.map((option) => (
            <button key={option} aria-pressed={sort === option} onClick={() => setSort(option)}>
              {option}
            </button>
          ))}
        </div>

        <button ref={triggerRef} onClick={() => setOpen((value) => !value)}>
          Filters
        </button>

        <div ref={panelRef} hidden={!open} role="dialog" aria-label="Filters" className="panel">
          <strong>Filter running shoes</strong>
          <label>
            <input type="checkbox" /> In stock
          </label>
          <label>
            <input type="checkbox" /> Free delivery
          </label>
        </div>

        <p role="status" className="status">
          Sorted by {sort}
        </p>
        <p>Showing 24 results. Click here to close the filters.</p>
      </div>
    </main>
  )
}
