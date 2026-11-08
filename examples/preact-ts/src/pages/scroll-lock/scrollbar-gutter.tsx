import { preventBodyScroll } from "@zag-js/remove-scroll"
import { useEffect, useState } from "preact/hooks"
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
        <p className="hint">
          The page reserves its scrollbar gutter. Lock scrolling and the header stays the same width.
        </p>
        <button data-testid="toggle-lock" aria-pressed={locked} onClick={() => setLocked((v) => !v)}>
          {locked ? "Unlock scrolling" : "Lock scrolling"}
        </button>
      </div>
    </main>
  )
}
