import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useEffectOnce } from "../hooks/use-effect-once"

/**
 * This example reproduces the submenu glitch issue:
 * https://github.com/chakra-ui/zag/issues/2931
 *
 * Bug: When moving cursor quickly between adjacent submenu trigger items,
 * sometimes the submenu opens briefly and then closes unexpectedly.
 *
 * To reproduce:
 * 1. Click "Open Menu" to open the parent menu
 * 2. Hover over "JS Frameworks" to open its submenu
 * 3. Quickly move the mouse to "CSS Frameworks"
 * 4. Sometimes the CSS Frameworks submenu opens briefly and closes
 */
export default function Page() {
  // Root menu
  const rootService = useMachine(menu.machine, { id: useId() })
  const root = menu.connect(rootService, normalizeProps)

  // Submenu 1: JS Frameworks
  const jsService = useMachine(menu.machine, { id: useId() })
  const js = menu.connect(jsService, normalizeProps)

  // Submenu 2: Lorem Ipsum (middle item)
  const loremService = useMachine(menu.machine, { id: useId() })
  const lorem = menu.connect(loremService, normalizeProps)

  // Submenu 3: CSS Frameworks
  const cssService = useMachine(menu.machine, { id: useId() })
  const css = menu.connect(cssService, normalizeProps)

  // Set up parent-child relationships
  useEffectOnce(() => {
    root.setChild(jsService)
    js.setParent(rootService)
  })

  useEffectOnce(() => {
    root.setChild(loremService)
    lorem.setParent(rootService)
  })

  useEffectOnce(() => {
    root.setChild(cssService)
    css.setParent(rootService)
  })

  const jsTriggerProps = root.getTriggerItemProps(js)
  const loremTriggerProps = root.getTriggerItemProps(lorem)
  const cssTriggerProps = root.getTriggerItemProps(css)

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
                <li {...root.getItemProps({ value: "new-file" })}>New File</li>
                <li data-testid="js-trigger" {...jsTriggerProps}>
                  JS Frameworks →
                </li>
                <li data-testid="lorem-trigger" {...loremTriggerProps}>
                  Lorem Ipsum →
                </li>
                <li data-testid="css-trigger" {...cssTriggerProps}>
                  CSS Frameworks →
                </li>
                <li {...root.getItemProps({ value: "settings" })}>Settings</li>
              </ul>
            </div>
          </Portal>

          {/* JS Frameworks Submenu */}
          <Portal>
            <div {...js.getPositionerProps()}>
              <ul data-testid="js-submenu" {...js.getContentProps()}>
                <li {...js.getItemProps({ value: "react" })}>React</li>
                <li {...js.getItemProps({ value: "solid" })}>Solid</li>
                <li {...js.getItemProps({ value: "vue" })}>Vue</li>
                <li {...js.getItemProps({ value: "svelte" })}>Svelte</li>
              </ul>
            </div>
          </Portal>

          {/* Lorem Ipsum Submenu */}
          <Portal>
            <div {...lorem.getPositionerProps()}>
              <ul data-testid="lorem-submenu" {...lorem.getContentProps()}>
                <li {...lorem.getItemProps({ value: "dolor" })}>Dolor</li>
                <li {...lorem.getItemProps({ value: "sit" })}>Sit</li>
                <li {...lorem.getItemProps({ value: "amet" })}>Amet</li>
              </ul>
            </div>
          </Portal>

          {/* CSS Frameworks Submenu */}
          <Portal>
            <div {...css.getPositionerProps()}>
              <ul data-testid="css-submenu" {...css.getContentProps()}>
                <li {...css.getItemProps({ value: "panda" })}>Panda</li>
                <li {...css.getItemProps({ value: "tailwind" })}>Tailwind</li>
                <li {...css.getItemProps({ value: "css-modules" })}>CSS Modules</li>
              </ul>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={rootService} label="Root" />
        <StateVisualizer state={jsService} label="JS Submenu" />
        <StateVisualizer state={loremService} label="Lorem Submenu" />
        <StateVisualizer state={cssService} label="CSS Submenu" />
      </Toolbar>
    </>
  )
}
