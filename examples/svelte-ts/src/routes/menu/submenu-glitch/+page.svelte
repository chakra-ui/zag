<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  // Moving quickly between adjacent submenu triggers must not open and then close the next submenu

  const id = $props.id()

  const rootService = useMachine(menu.machine, { id })
  const root = $derived(menu.connect(rootService, normalizeProps))

  const jsService = useMachine(menu.machine, { id: `${id}-js` })
  const js = $derived(menu.connect(jsService, normalizeProps))

  const loremService = useMachine(menu.machine, { id: `${id}-lorem` })
  const lorem = $derived(menu.connect(loremService, normalizeProps))

  const cssService = useMachine(menu.machine, { id: `${id}-css` })
  const css = $derived(menu.connect(cssService, normalizeProps))

  onMount(() => {
    root.setChild(jsService)
    js.setParent(rootService)
    root.setChild(loremService)
    lorem.setParent(rootService)
    root.setChild(cssService)
    css.setParent(rootService)
  })

  const jsTriggerProps = $derived(root.getTriggerItemProps(js))
  const loremTriggerProps = $derived(root.getTriggerItemProps(lorem))
  const cssTriggerProps = $derived(root.getTriggerItemProps(css))
</script>

<main>
  <div>
    <button data-testid="trigger" {...root.getTriggerProps()}>Open Menu</button>

    <Portal>
      <div {...root.getPositionerProps()}>
        <ul data-testid="menu" {...root.getContentProps()}>
          <li {...root.getItemProps({ value: "new-file" })}>New File</li>
          <li data-testid="js-trigger" {...jsTriggerProps}>JS Frameworks →</li>
          <li data-testid="lorem-trigger" {...loremTriggerProps}>Lorem Ipsum →</li>
          <li data-testid="css-trigger" {...cssTriggerProps}>CSS Frameworks →</li>
          <li {...root.getItemProps({ value: "settings" })}>Settings</li>
        </ul>
      </div>
    </Portal>

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

    <Portal>
      <div {...lorem.getPositionerProps()}>
        <ul data-testid="lorem-submenu" {...lorem.getContentProps()}>
          <li {...lorem.getItemProps({ value: "dolor" })}>Dolor</li>
          <li {...lorem.getItemProps({ value: "sit" })}>Sit</li>
          <li {...lorem.getItemProps({ value: "amet" })}>Amet</li>
        </ul>
      </div>
    </Portal>

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

<Toolbar>
  <StateVisualizer state={rootService} label="Root" />
  <StateVisualizer state={jsService} label="JS Submenu" />
  <StateVisualizer state={loremService} label="Lorem Submenu" />
  <StateVisualizer state={cssService} label="CSS Submenu" />
</Toolbar>
