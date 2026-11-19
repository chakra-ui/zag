import { trackFocusVisible } from "@zag-js/focus-visible"
import { useEffect, useState } from "preact/hooks"
import "@styles/focus-visible.css"

const projects = [
  { name: "Design system", meta: "42 components" },
  { name: "Mobile app", meta: "Updated 2 hours ago" },
  { name: "Marketing site", meta: "3 open reviews" },
  { name: "Billing service", meta: "Deployed yesterday" },
]

export default function Page() {
  const [focusVisible, setFocusVisible] = useState(false)
  const [focusWithin, setFocusWithin] = useState(false)

  useEffect(() => trackFocusVisible({ onChange: (details) => setFocusVisible(details.isFocusVisible) }), [])

  return (
    <main>
      <div className="focus-visible-card-grid">
        <p className="hint">Tab through the projects to outline the grid. Clicking a project doesn't.</p>
        <div
          className="grid"
          data-testid="card-grid"
          data-focus-visible={focusVisible && focusWithin ? "" : undefined}
          onFocusIn={() => setFocusWithin(true)}
          onFocusOut={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
            setFocusWithin(false)
          }}
        >
          {projects.map((project) => (
            <button key={project.name} type="button" className="card">
              <strong>{project.name}</strong>
              <span className="meta">{project.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
