import { isFocusRestoredByWindow, trackFocusVisible } from "@zag-js/focus-visible"
import { useEffect, useState } from "preact/hooks"
import "@styles/focus-visible.css"

const recentSearches = ["Controlled state", "Positioning", "Form integration"]

export default function Page() {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [lastFocus, setLastFocus] = useState("Not focused yet")

  useEffect(() => trackFocusVisible(), [])

  return (
    <main>
      <div className="focus-visible-window-restore">
        <p className="hint">
          Focus the search, switch to another tab and come back. Recent searches don't pop open on their own.
        </p>
        <div
          className="search"
          onFocusOut={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            setOpen(false)
          }}
        >
          <input
            type="search"
            aria-label="Search docs"
            placeholder="Search docs"
            value={query}
            onInput={(event) => setQuery(event.currentTarget.value)}
            onFocus={() => {
              const restored = isFocusRestoredByWindow()
              setLastFocus(restored ? "Restored by the window" : "Moved by you")
              if (!restored) setOpen(true)
            }}
          />
          {open && (
            <ul className="recent" aria-label="Recent searches">
              {recentSearches.map((search) => (
                <li key={search}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setQuery(search)}
                  >
                    {search}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="status">
          Last focus: <span data-testid="last-focus">{lastFocus}</span>
        </p>
      </div>
    </main>
  )
}
