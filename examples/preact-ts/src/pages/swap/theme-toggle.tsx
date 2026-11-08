import { useState } from "preact/hooks"
import { Swap } from "../../components/swap"
import "@styles/swap.css"

export default function Page() {
  const [dark, setDark] = useState(false)

  return (
    <main>
      <div className="swap-theme-toggle">
        <button
          type="button"
          className="swap-trigger"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setDark((v) => !v)}
        >
          <Swap
            open={dark}
            fallback={
              <svg className="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-sun">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            }
          >
            <svg className="swap-icon" viewBox="0 0 24 24" aria-hidden="true" data-testid="icon-moon">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </Swap>
        </button>
        <p className="swap-hint">Click the button to flip between sun and moon.</p>
      </div>
    </main>
  )
}
