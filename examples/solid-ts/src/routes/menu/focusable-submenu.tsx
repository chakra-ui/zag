import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

/**
 * Nested menus with focusable elements (like inputs) should not close the
 * parent menu when hovering between trigger items (#2932).
 */
export default function Page() {
  const rootService = useMachine(menu.machine, { id: createUniqueId() })
  const root = createMemo(() => menu.connect(rootService, normalizeProps))

  const sub1Service = useMachine(menu.machine, { id: createUniqueId() })
  const sub1 = createMemo(() => menu.connect(sub1Service, normalizeProps))

  const sub2Service = useMachine(menu.machine, { id: createUniqueId() })
  const sub2 = createMemo(() => menu.connect(sub2Service, normalizeProps))

  const sub3Service = useMachine(menu.machine, { id: createUniqueId() })
  const sub3 = createMemo(() => menu.connect(sub3Service, normalizeProps))

  onMount(() => {
    root().setChild(sub1Service)
    sub1().setParent(rootService)
    root().setChild(sub2Service)
    sub2().setParent(rootService)
    root().setChild(sub3Service)
    sub3().setParent(rootService)
  })

  const sub1TriggerProps = createMemo(() => root().getTriggerItemProps(sub1()))
  const sub2TriggerProps = createMemo(() => root().getTriggerItemProps(sub2()))
  const sub3TriggerProps = createMemo(() => root().getTriggerItemProps(sub3()))

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...root().getTriggerProps()}>
            Open Menu
          </button>

          {/* Root Menu */}
          <Portal>
            <div {...root().getPositionerProps()}>
              <ul data-testid="menu" {...root().getContentProps()}>
                <li {...root().getItemProps({ value: "item1" })}>Regular Item 1</li>
                <li data-testid="sub1-trigger" {...sub1TriggerProps()}>
                  Submenu with Input 1 →
                </li>
                <li data-testid="sub2-trigger" {...sub2TriggerProps()}>
                  Submenu with Input 2 →
                </li>
                <li data-testid="sub3-trigger" {...sub3TriggerProps()}>
                  Submenu with Input 3 →
                </li>
                <li {...root().getItemProps({ value: "item2" })}>Regular Item 2</li>
              </ul>
            </div>
          </Portal>

          {/* Submenu 1 */}
          <Portal>
            <div {...sub1().getPositionerProps()}>
              <div data-testid="sub1-content" {...sub1().getContentProps()}>
                <input placeholder="Type here..." style={{ padding: "8px", margin: "8px" }} />
              </div>
            </div>
          </Portal>

          {/* Submenu 2 */}
          <Portal>
            <div {...sub2().getPositionerProps()}>
              <div data-testid="sub2-content" {...sub2().getContentProps()}>
                <input placeholder="Type here..." style={{ padding: "8px", margin: "8px" }} />
              </div>
            </div>
          </Portal>

          {/* Submenu 3 */}
          <Portal>
            <div {...sub3().getPositionerProps()}>
              <div data-testid="sub3-content" {...sub3().getContentProps()}>
                <input placeholder="Type here..." style={{ padding: "8px", margin: "8px" }} />
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={rootService} label="Root" />
        <StateVisualizer state={sub1Service} label="Sub1" />
        <StateVisualizer state={sub2Service} label="Sub2" />
        <StateVisualizer state={sub3Service} label="Sub3" />
      </Toolbar>
    </>
  )
}
