<script lang="ts">
  import { afterNavigate } from "$app/navigation"
  import { page } from "$app/state"
  import * as dialog from "@zag-js/dialog"
  import { createHotkeyStore } from "@zag-js/hotkeys"
  import { getComponentExamples } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import {
    ChevronsUpDownIcon,
    FocusIcon,
    Maximize2Icon,
    Minimize2Icon,
    PanelBottomIcon,
    PanelRightIcon,
    SearchIcon,
    SquareDashedIcon,
  } from "lucide-svelte"
  import { onMount, tick, type Snippet } from "svelte"
  import CommandPalette, { type PaletteMode } from "./command-palette.svelte"
  import ZagLogo from "./zag-logo.svelte"
  import { readPref, writePref } from "./prefs"

  type CanvasLayout = "centered" | "padded"
  type InspectorDock = "right" | "bottom"

  const layouts = [
    { value: "centered", label: "Centered", icon: FocusIcon },
    { value: "padded", label: "Padded", icon: SquareDashedIcon },
  ] as const

  const docks = [
    { value: "right", label: "Right", icon: PanelRightIcon },
    { value: "bottom", label: "Bottom", icon: PanelBottomIcon },
  ] as const

  let { children }: { children: Snippet } = $props()

  // The head script already applied saved prefs to <html>; these only sync the toggles
  let layout = $state<CanvasLayout>("centered")
  let dock = $state<InspectorDock>("right")
  let inspectorOpen = $state(true)
  let fullscreenInspectorOpen = $state(false)
  let fullscreen = $state(false)
  let hasInspector = $state(false)
  let mode = $state<PaletteMode>({ type: "all" })

  const segments = $derived(page.url.pathname.split("/").filter(Boolean))
  const component = $derived(segments[0])
  const currentPath = $derived(segments[0] && segments[1] ? `/${segments[0]}/${segments[1]}` : null)

  const isFullscreen = $derived(fullscreen && !!currentPath)
  const inspectorShown = $derived(isFullscreen ? fullscreenInspectorOpen : inspectorOpen)

  const examples = $derived(component ? getComponentExamples(component) : [])
  const componentLabel = $derived(examples[0]?.componentLabel)
  const exampleLabel = $derived(examples.find((item) => item.path === currentPath)?.title)

  function setLayout(next: CanvasLayout) {
    layout = next
    writePref("layout", next)
  }

  // Full screen keeps its own setting so leaving it restores the panel
  function toggleInspector() {
    if (isFullscreen) {
      fullscreenInspectorOpen = !fullscreenInspectorOpen
      return
    }
    inspectorOpen = !inspectorOpen
    writePref("inspector", inspectorOpen ? "shown" : "hidden")
  }

  function selectDock(next: InspectorDock) {
    if (inspectorShown && dock === next) return toggleInspector()
    dock = next
    writePref("dock", next)
    if (!inspectorShown) toggleInspector()
  }

  function exitFullscreen() {
    fullscreen = false
    fullscreenInspectorOpen = false
  }

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))

  function openPalette(next: PaletteMode) {
    mode = next
    api.setOpen(true)
  }

  // Not every example renders an inspector, so read it from the page once it mounts
  let body = $state<HTMLElement | null>(null)
  const checkInspector = () => {
    hasInspector = !!body?.querySelector(":scope > .toolbar")
  }

  afterNavigate(() => tick().then(checkInspector))

  onMount(() => {
    const storedLayout = readPref("layout")
    if (storedLayout) layout = storedLayout
    const storedDock = readPref("dock")
    if (storedDock) dock = storedDock
    if (readPref("inspector") === "hidden") inspectorOpen = false

    checkInspector()
    const observer = new MutationObserver(checkInspector)
    if (body) observer.observe(body, { childList: true })

    const hotkeys = createHotkeyStore()
    hotkeys.register({
      id: "playground-search",
      hotkey: "mod+K",
      label: "Search examples",
      action: () => openPalette({ type: "all" }),
      options: { preventDefault: true },
    })
    hotkeys.register({
      id: "playground-fullscreen",
      hotkey: "mod+shift+F",
      label: "Toggle full screen",
      action: () => (fullscreen = !fullscreen),
      options: { preventDefault: true },
    })
    hotkeys.register({
      id: "playground-inspector",
      hotkey: "mod+.",
      label: "Toggle inspector",
      action: () => toggleInspector(),
      options: { preventDefault: true },
    })
    hotkeys.init({ target: document })

    return () => {
      observer.disconnect()
      hotkeys.destroy()
    }
  })
</script>

<div class="pg" data-fullscreen={isFullscreen ? "" : undefined} data-inspector={inspectorShown ? "shown" : "hidden"}>
  <header class="pg-topbar">
    <div class="pg-topbar-start">
      <a href="/" class="pg-brand" aria-label="All components"><ZagLogo /></a>

      <span class="pg-slash" aria-hidden="true"></span>

      <button
        type="button"
        class="pg-crumb"
        aria-label="Change component"
        title={componentLabel ? `Component: ${componentLabel}` : undefined}
        onclick={() => openPalette({ type: "components" })}
      >
        <span data-placeholder={componentLabel ? undefined : ""}>{componentLabel ?? "Select component"}</span>
        <ChevronsUpDownIcon aria-hidden="true" />
      </button>

      {#if component}
        <span class="pg-slash" aria-hidden="true"></span>
        <button
          type="button"
          class="pg-crumb"
          aria-label="Change example"
          title={exampleLabel ? `Example: ${exampleLabel}` : undefined}
          onclick={() => openPalette({ type: "examples", component })}
        >
          <span data-placeholder={exampleLabel ? undefined : ""}>{exampleLabel ?? "Select example"}</span>
          <ChevronsUpDownIcon aria-hidden="true" />
        </button>
      {/if}
    </div>

    <div class="pg-topbar-center">
      <button type="button" class="pg-search-trigger" onclick={() => openPalette({ type: "all" })}>
        <SearchIcon aria-hidden="true" />
        <span>Search examples…</span>
        <kbd class="pg-kbd">⌘K</kbd>
      </button>
    </div>

    <div class="pg-topbar-end">
      {#if currentPath}
        <div class="pg-segmented" role="group" aria-label="Canvas layout">
          {#each layouts as item (item.value)}
            <button
              type="button"
              class="pg-segmented-item"
              aria-pressed={layout === item.value}
              aria-label={`${item.label} layout`}
              title={`${item.label} layout`}
              onclick={() => setLayout(item.value)}
            >
              <item.icon aria-hidden="true" />
            </button>
          {/each}
        </div>

        <button
          type="button"
          class="pg-btn"
          data-icon
          aria-label="Full screen"
          title="Full screen (⌘⇧F)"
          onclick={() => (fullscreen = true)}
        >
          <Maximize2Icon aria-hidden="true" />
        </button>

        <div
          class="pg-segmented"
          role="group"
          aria-label="Inspector"
          aria-disabled={!hasInspector || undefined}
          title={hasInspector ? undefined : "This example has no inspector"}
        >
          {#each docks as item (item.value)}
            <button
              type="button"
              class="pg-segmented-item"
              disabled={!hasInspector}
              aria-pressed={hasInspector && inspectorShown && dock === item.value}
              aria-label={`Inspector ${item.label.toLowerCase()}`}
              title={`Inspector ${item.label.toLowerCase()} (⌘. to toggle)`}
              onclick={() => selectDock(item.value)}
            >
              <item.icon aria-hidden="true" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </header>

  <div bind:this={body} class="pg-body" data-layout={layout}>
    {@render children()}
  </div>

  {#if isFullscreen}
    <div class="pg-floating-bar" role="toolbar" aria-label="Full screen">
      {#if hasInspector}
        <button type="button" aria-pressed={inspectorShown} title="Toggle inspector (⌘.)" onclick={toggleInspector}>
          {#if dock === "bottom"}
            <PanelBottomIcon aria-hidden="true" />
          {:else}
            <PanelRightIcon aria-hidden="true" />
          {/if}
          Inspector
        </button>
      {/if}
      <button type="button" title="Exit full screen (⌘⇧F)" onclick={exitFullscreen}>
        <Minimize2Icon aria-hidden="true" />
        Exit full screen
        <kbd class="pg-kbd">⌘⇧F</kbd>
      </button>
    </div>
  {/if}

  {#if api.open}
    <CommandPalette {api} {mode} {currentPath} />
  {/if}
</div>
