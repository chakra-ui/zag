import { isFocusRestoredByWindow, trackFocusVisible } from "@zag-js/focus-visible"
import { createSignal, For, onSettled, Show } from "solid-js"
import "@styles/focus-visible.css"

const recentSearches = ["Controlled state", "Positioning", "Form integration"]

export default function Page() {
  const [query, setQuery] = createSignal("")
  const [open, setOpen] = createSignal(false)
  const [lastFocus, setLastFocus] = createSignal("Not focused yet")

  onSettled(() => trackFocusVisible())

  return (
    <main>
      <div class="focus-visible-window-restore">
        <p class="hint">
          Focus the search, switch to another tab and come back. Recent searches don't pop open on their own.
        </p>
        <div
          class="search"
          onFocusOut={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            setOpen(false)
          }}
        >
          <input
            type="search"
            aria-label="Search docs"
            placeholder="Search docs"
            value={query()}
            onInput={(event) => setQuery(event.currentTarget.value)}
            onFocus={() => {
              const restored = isFocusRestoredByWindow()
              setLastFocus(restored ? "Restored by the window" : "Moved by you")
              if (!restored) setOpen(true)
            }}
          />
          <Show when={open()}>
            <ul class="recent" aria-label="Recent searches">
              <For each={recentSearches}>
                {(search) => (
                  <li>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setQuery(search)}
                    >
                      {search}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
        <p class="status">
          Last focus: <span data-testid="last-focus">{lastFocus()}</span>
        </p>
      </div>
    </main>
  )
}
