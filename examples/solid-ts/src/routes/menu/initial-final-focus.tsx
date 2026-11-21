import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

export default function Page() {
  let secondaryRef: HTMLButtonElement | undefined
  let finalRef: HTMLButtonElement | undefined

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    initialFocusEl: () => secondaryRef ?? null,
    finalFocusEl: () => finalRef ?? null,
  })
  const contextService = useMachine(menu.machine, {
    id: createUniqueId(),
    finalFocusEl: () => finalRef ?? null,
  })
  const noFocusService = useMachine(menu.machine, {
    id: createUniqueId(),
    initialFocusEl: () => false,
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))
  const contextApi = createMemo(() => menu.connect(contextService, normalizeProps))
  const noFocusApi = createMemo(() => menu.connect(noFocusService, normalizeProps))

  return (
    <>
      <main>
        <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
          <button data-testid="trigger" {...api().getTriggerProps()}>
            Actions
          </button>
          <button data-testid="no-focus-trigger" {...noFocusApi().getTriggerProps()}>
            No initial focus
          </button>
          <button data-testid="final-focus" ref={finalRef}>
            Final focus target
          </button>
          <button data-testid="outside">Outside</button>
        </div>

        <div data-testid="context-trigger" {...contextApi().getContextTriggerProps()}>
          Right click here
        </div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <button data-testid="primary">Primary</button>
              <button data-testid="secondary" ref={secondaryRef}>
                Secondary
              </button>
              <div {...api().getListProps()}>
                <div {...api().getItemProps({ value: "edit" })}>Edit</div>
                <div {...api().getItemProps({ value: "duplicate" })}>Duplicate</div>
              </div>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...contextApi().getPositionerProps()}>
            <div data-testid="context-content" {...contextApi().getContentProps()}>
              <div {...contextApi().getListProps()}>
                <div {...contextApi().getItemProps({ value: "rename" })}>Rename</div>
                <div {...contextApi().getItemProps({ value: "delete" })}>Delete</div>
              </div>
            </div>
          </div>
        </Portal>

        <Portal>
          <div {...noFocusApi().getPositionerProps()}>
            <div data-testid="no-focus-content" {...noFocusApi().getContentProps()}>
              <div {...noFocusApi().getListProps()}>
                <div {...noFocusApi().getItemProps({ value: "a" })}>A</div>
                <div {...noFocusApi().getItemProps({ value: "b" })}>B</div>
              </div>
            </div>
          </div>
        </Portal>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
