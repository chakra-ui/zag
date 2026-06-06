<script lang="ts">
  import type * as menu from "@zag-js/menu"
  import * as menubar from "@zag-js/menubar"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { setContext } from "svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import Menu from "./menu.svelte"
  import "@styles/menu.css"

  const service = useMachine(menubar.machine, { id: "menubar" })
  const api = $derived(menubar.connect(service, normalizeProps))

  setContext<menu.MenubarContext>("menubar", api.getMenuContext())

  const fileItems = [
    { value: "new", label: "New File" },
    { value: "open", label: "Open..." },
    { value: "save", label: "Save" },
  ]
  const editItems = [
    { value: "undo", label: "Undo" },
    { value: "redo", label: "Redo" },
    { value: "cut", label: "Cut" },
  ]
  const viewItems = [
    { value: "zoom-in", label: "Zoom In" },
    { value: "zoom-out", label: "Zoom Out" },
  ]
</script>

<main class="menubar">
  <div {...api.getRootProps()} style="display: inline-flex; gap: 4px;">
    <Menu id="file" label="File" items={fileItems} />
    <Menu id="edit" label="Edit" items={editItems} />
    <Menu id="view" label="View" items={viewItems} />
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
