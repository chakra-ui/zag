import { trackFocusVisible } from "@zag-js/focus-visible"
import { createSignal, For, onSettled } from "solid-js"
import "@styles/focus-visible.css"

const projects = [
  { name: "Design system", meta: "42 components" },
  { name: "Mobile app", meta: "Updated 2 hours ago" },
  { name: "Marketing site", meta: "3 open reviews" },
  { name: "Billing service", meta: "Deployed yesterday" },
]

export default function Page() {
  const [focusVisible, setFocusVisible] = createSignal(false)
  const [focusWithin, setFocusWithin] = createSignal(false)

  onSettled(() => trackFocusVisible({ onChange: (details) => setFocusVisible(details.isFocusVisible) }))

  return (
    <main>
      <div class="focus-visible-card-grid">
        <p class="hint">Tab through the projects to outline the grid. Clicking a project doesn't.</p>
        <div
          class="grid"
          data-testid="card-grid"
          data-focus-visible={focusVisible() && focusWithin() ? "" : undefined}
          onFocusIn={() => setFocusWithin(true)}
          onFocusOut={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            setFocusWithin(false)
          }}
        >
          <For each={projects}>
            {(project) => (
              <button type="button" class="card">
                <strong>{project.name}</strong>
                <span class="meta">{project.meta}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
