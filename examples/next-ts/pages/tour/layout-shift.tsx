import { tourLayoutShiftData } from "@zag-js/shared"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tour from "@zag-js/tour"
import { useId, useState } from "react"

export default function Page() {
  const [wide, setWide] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const service = useMachine(tour.machine, { id: useId(), steps: tourLayoutShiftData })
  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <style jsx global>
        {layoutShiftStyles}
      </style>

      <main className="tour layout-shift">
        <button onClick={() => api.start()}>Start tour</button>

        <div className="targets">
          <button id="layout-target" data-wide={wide || undefined}>
            First target
          </button>
          <button id="other-target" data-wide={wide || undefined}>
            Second target
          </button>
        </div>

        <div className="filler" data-expanded={expanded || undefined}>
          {expanded ? "Extra content is in the page." : "Use the tour controls to shift the layout."}
        </div>
      </main>

      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getSpotlightProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <p {...api.getTitleProps()}>{api.step?.title}</p>
              <div {...api.getDescriptionProps()}>{api.step?.description}</div>

              <div className="tour button__group">
                <button onClick={() => setWide((value) => !value)}>Resize target</button>
                <button onClick={() => setExpanded((value) => !value)}>Toggle extra content</button>
                {api.step?.actions?.map((action) => (
                  <button key={action.label} {...api.getActionTriggerProps({ action })}>
                    {action.label}
                  </button>
                ))}
              </div>

              <button {...api.getCloseTriggerProps()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

// A fixed-height root that gains overflow — the layout change a ResizeObserver cannot see.
const layoutShiftStyles = `
  html { height: 100%; }
  body { min-height: 100%; }
  body, .page, .page main { overflow: visible; }
  .page { height: auto; min-height: 100vh; }
  .page main { display: block; }
  .nav { flex-shrink: 0; height: 100vh; }

  .layout-shift { padding: 40px; }
  .layout-shift .targets { display: flex; gap: 80px; margin-top: 40px; }
  .layout-shift .targets button { width: 160px; }
  .layout-shift .targets button[data-wide] { width: 280px; }
  .layout-shift .filler { height: 100px; padding-top: 40px; }
  .layout-shift .filler[data-expanded] { height: 2000px; }
`
