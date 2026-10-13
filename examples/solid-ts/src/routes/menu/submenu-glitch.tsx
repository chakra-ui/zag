import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

/**
 * Moving quickly between adjacent submenu triggers should not open a submenu
 * briefly and then close it (#2931).
 */
export default function Page() {
  const rootService = useMachine(menu.machine, { id: createUniqueId() })
  const root = createMemo(() => menu.connect(rootService, normalizeProps))

  const jsService = useMachine(menu.machine, { id: createUniqueId() })
  const js = createMemo(() => menu.connect(jsService, normalizeProps))

  const loremService = useMachine(menu.machine, { id: createUniqueId() })
  const lorem = createMemo(() => menu.connect(loremService, normalizeProps))

  const cssService = useMachine(menu.machine, { id: createUniqueId() })
  const css = createMemo(() => menu.connect(cssService, normalizeProps))

  onMount(() => {
    root().setChild(jsService)
    js().setParent(rootService)
    root().setChild(loremService)
    lorem().setParent(rootService)
    root().setChild(cssService)
    css().setParent(rootService)
  })

  const jsTriggerProps = createMemo(() => root().getTriggerItemProps(js()))
  const loremTriggerProps = createMemo(() => root().getTriggerItemProps(lorem()))
  const cssTriggerProps = createMemo(() => root().getTriggerItemProps(css()))

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
                <li {...root().getItemProps({ value: "new-file" })}>New File</li>
                <li data-testid="js-trigger" {...jsTriggerProps()}>
                  JS Frameworks →
                </li>
                <li data-testid="lorem-trigger" {...loremTriggerProps()}>
                  Lorem Ipsum →
                </li>
                <li data-testid="css-trigger" {...cssTriggerProps()}>
                  CSS Frameworks →
                </li>
                <li {...root().getItemProps({ value: "settings" })}>Settings</li>
              </ul>
            </div>
          </Portal>

          {/* JS Frameworks Submenu */}
          <Portal>
            <div {...js().getPositionerProps()}>
              <ul data-testid="js-submenu" {...js().getContentProps()}>
                <li {...js().getItemProps({ value: "react" })}>React</li>
                <li {...js().getItemProps({ value: "solid" })}>Solid</li>
                <li {...js().getItemProps({ value: "vue" })}>Vue</li>
                <li {...js().getItemProps({ value: "svelte" })}>Svelte</li>
              </ul>
            </div>
          </Portal>

          {/* Lorem Ipsum Submenu */}
          <Portal>
            <div {...lorem().getPositionerProps()}>
              <ul data-testid="lorem-submenu" {...lorem().getContentProps()}>
                <li {...lorem().getItemProps({ value: "dolor" })}>Dolor</li>
                <li {...lorem().getItemProps({ value: "sit" })}>Sit</li>
                <li {...lorem().getItemProps({ value: "amet" })}>Amet</li>
              </ul>
            </div>
          </Portal>

          {/* CSS Frameworks Submenu */}
          <Portal>
            <div {...css().getPositionerProps()}>
              <ul data-testid="css-submenu" {...css().getContentProps()}>
                <li {...css().getItemProps({ value: "panda" })}>Panda</li>
                <li {...css().getItemProps({ value: "tailwind" })}>Tailwind</li>
                <li {...css().getItemProps({ value: "css-modules" })}>CSS Modules</li>
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
