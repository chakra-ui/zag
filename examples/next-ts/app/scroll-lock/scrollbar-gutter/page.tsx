"use client"

import { preventBodyScroll } from "@zag-js/remove-scroll"
import { useEffect, useState } from "react"
import "@styles/scroll-lock.css"

export default function Page() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!locked) return
    return preventBodyScroll()
  }, [locked])

  return (
    <main>
      <div className="scrollbar-gutter">
        <div className="header" data-testid="header">
          Northwind Design
        </div>
        <p className="hint">Lock scrolling and watch the header keep its width.</p>
        <button data-testid="toggle-lock" aria-pressed={locked} onClick={() => setLocked((v) => !v)}>
          {locked ? "Unlock scrolling" : "Lock scrolling"}
        </button>
      </div>
    </main>
  )
}
