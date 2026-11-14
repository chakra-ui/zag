"use client"

import { preventBodyScroll } from "@zag-js/remove-scroll"
import { useEffect, useState } from "react"
import "@styles/scroll-lock.css"

const items = Array.from({ length: 30 }, (_, i) => `Result ${i + 1}`)

export default function Page() {
  const [open, setOpen] = useState(false)
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      setNavHidden(window.scrollY > lastY)
      lastY = window.scrollY
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    return preventBodyScroll()
  }, [open])

  return (
    <main>
      <div className="scroll-position">
        <nav className="nav" data-hidden={navHidden || undefined}>
          Store
          <button onClick={() => setOpen(true)}>Open filters</button>
        </nav>
        <p className="hint">
          Scroll down, then up until the nav shows. Open and close the filters: the nav should stay put.
        </p>

        {open && (
          <>
            <div className="backdrop" />
            <div className="panel" role="dialog" aria-modal="true" aria-label="Filters">
              <span className="panel-title">Filters</span>
              <div className="list">
                {items.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
              <button onClick={() => setOpen(false)}>Show results</button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
