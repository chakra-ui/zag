<script lang="ts">
  import MenubarActionMenu from "#lib/components/menubar-action-menu.svelte"
  import MenubarViewMenu from "#lib/components/menubar-view-menu.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import type * as menu from "@zag-js/menu"
  import * as menubar from "@zag-js/menubar"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { setContext } from "svelte"
  import "@styles/menu.css"

  const fileActions = [
    { value: "new", label: "New", shortcut: "⌘N" },
    { value: "save", label: "Save", shortcut: "⌘S" },
    { value: "export", label: "Export…", disabled: true },
  ]

  const editActions = [
    { value: "undo", label: "Undo", shortcut: "⌘Z" },
    { value: "redo", label: "Redo", shortcut: "⇧⌘Z", disabled: true },
    { value: "select-all", label: "Select all", shortcut: "⌘A" },
  ]

  let lastAction = $state("none")
  let settings = $state({ lineNumbers: true, wordWrap: false, theme: "System" })

  const id = $props.id()
  const service = useMachine(menubar.machine, { id })
  const api = $derived(menubar.connect(service, normalizeProps))

  setContext<() => menu.MenubarContext>("menubar", () => api.getMenuContext())
</script>

<main>
  <div class="menubar-app-menu">
    <p class="hint">An editor's menu bar: shortcuts, a disabled action, toggles and a theme picker.</p>
    <div {...api.getRootProps()}>
      <MenubarActionMenu id="file" label="File" actions={fileActions} onRun={(label) => (lastAction = label)} />
      <MenubarActionMenu id="edit" label="Edit" actions={editActions} onRun={(label) => (lastAction = label)} />
      <MenubarViewMenu {settings} onChange={(next) => (settings = next)} />
    </div>
    <p class="status" data-testid="last-action">Last action: {lastAction}</p>
    <p class="status" data-testid="view-state">
      Line numbers {settings.lineNumbers ? "on" : "off"} · Word wrap {settings.wordWrap ? "on" : "off"} · Theme: {settings.theme}
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
