import { useState } from "preact/hooks"
import { Swap } from "../../components/swap"
import "@styles/swap.css"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <main>
      <div className="swap-menu-toggle">
        <button
          type="button"
          className="swap-trigger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Swap
            open={open}
            fallback={
              <svg className="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-menu">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            }
          >
            <svg className="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-close">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Swap>
        </button>
        <p className="swap-hint">Click the button to swap the menu icon.</p>
      </div>
    </main>
  )
}
