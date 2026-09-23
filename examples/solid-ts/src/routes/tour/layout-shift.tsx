import { tourLayoutShiftData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const [wide, setWide] = createSignal(false)
  const [expanded, setExpanded] = createSignal(false)

  const service = useMachine(tour.machine, { id: createUniqueId(), steps: tourLayoutShiftData })
  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <style>{layoutShiftStyles}</style>

      <main class="tour layout-shift">
        <button onClick={() => api().start()}>Start tour</button>

        <div class="targets">
          <button id="layout-target" data-wide={wide() || undefined}>
            First target
          </button>
          <button id="other-target" data-wide={wide() || undefined}>
            Second target
          </button>
        </div>

        <div class="filler" data-expanded={expanded() || undefined}>
          {expanded() ? "Extra content is in the page." : "Use the tour controls to shift the layout."}
        </div>
      </main>

      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getSpotlightProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <p {...api().getTitleProps()}>{api().step?.title}</p>
              <div {...api().getDescriptionProps()}>{api().step?.description}</div>

              <div class="tour button__group">
                <button onClick={() => setWide((value) => !value)}>Resize target</button>
                <button onClick={() => setExpanded((value) => !value)}>Toggle extra content</button>
                <For each={api().step?.actions}>
                  {(action) => <button {...api().getActionTriggerProps({ action })}>{action.label}</button>}
                </For>
              </div>

              <button {...api().getCloseTriggerProps()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
          </div>
        </Portal>
      </Show>
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
