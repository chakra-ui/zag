import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useEffectOnce } from "../hooks/use-effect-once"

/**
 * This example tests issue #2932:
 * https://github.com/chakra-ui/zag/issues/2932
 *
 * Bug: Nested menus with focusable elements (like inputs) cause the parent
 * menu to close unexpectedly when hovering between trigger items.
 *
 * To reproduce:
 * 1. Click "Open Menu" to open the parent menu
 * 2. Hover over trigger items quickly
 * 3. The parent menu should NOT close unexpectedly
 */
export default function Page() {
  // Root menu
  const rootService = useMachine(menu.machine, { id: useId() })
  const root = menu.connect(rootService, normalizeProps)

  // Submenu 1: With input
  const sub1Service = useMachine(menu.machine, { id: useId() })
  const sub1 = menu.connect(sub1Service, normalizeProps)

  // Submenu 2: With input
  const sub2Service = useMachine(menu.machine, { id: useId() })
  const sub2 = menu.connect(sub2Service, normalizeProps)

  // Submenu 3: With input
  const sub3Service = useMachine(menu.machine, { id: useId() })
  const sub3 = menu.connect(sub3Service, normalizeProps)

  // Set up parent-child relationships
  useEffectOnce(() => {
    root.setChild(sub1Service)
    sub1.setParent(rootService)
  })

  useEffectOnce(() => {
    root.setChild(sub2Service)
    sub2.setParent(rootService)
  })

  useEffectOnce(() => {
    root.setChild(sub3Service)
    sub3.setParent(rootService)
  })

  const sub1TriggerProps = root.getTriggerItemProps(sub1)
  const sub2TriggerProps = root.getTriggerItemProps(sub2)
  const sub3TriggerProps = root.getTriggerItemProps(sub3)

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...root.getTriggerProps()}>
            Open Menu
          </button>

          {/* Root Menu */}
          <Portal>
            <div {...root.getPositionerProps()}>
              <ul data-testid="menu" {...root.getContentProps()}>
                <li {...root.getItemProps({ value: "item1" })}>Regular Item 1</li>
                <li data-testid="sub1-trigger" {...sub1TriggerProps}>
                  Submenu with Input 1 →
                </li>
                <li data-testid="sub2-trigger" {...sub2TriggerProps}>
                  Submenu with Input 2 →
                </li>
                <li data-testid="sub3-trigger" {...sub3TriggerProps}>
                  Submenu with Input 3 →
                </li>
                <li {...root.getItemProps({ value: "item2" })}>Regular Item 2</li>
              </ul>
            </div>
          </Portal>

          {/* Submenu 1 */}
          <Portal>
            <div {...sub1.getPositionerProps()}>
              <div data-testid="sub1-content" {...sub1.getContentProps()}>
                <input placeholder="Type here..." style={{ padding: "8px", margin: "8px" }} />
              </div>
            </div>
          </Portal>

          {/* Submenu 2 */}
          <Portal>
            <div {...sub2.getPositionerProps()}>
              <div data-testid="sub2-content" {...sub2.getContentProps()}>
                <input placeholder="Type here..." style={{ padding: "8px", margin: "8px" }} />
              </div>
            </div>
          </Portal>

          {/* Submenu 3 */}
          <Portal>
            <div {...sub3.getPositionerProps()}>
              <div data-testid="sub3-content" {...sub3.getContentProps()}>
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
