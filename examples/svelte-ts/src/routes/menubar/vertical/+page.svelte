<script lang="ts">
  import MenubarMenu from "$lib/components/menubar-menu.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import type * as menu from "@zag-js/menu"
  import * as menubar from "@zag-js/menubar"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { setContext } from "svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menubar.machine, { id, orientation: "vertical" })
  const api = $derived(menubar.connect(service, normalizeProps))

  setContext<menu.MenubarContext>("menubar", api.getMenuContext())

  // Vertical menubar menus fly out to the side.
  const positioning: menu.Props["positioning"] = { placement: "right-start", gutter: 4 }

  const menus = [
    {
      id: "file",
      label: "File",
      items: [
        { value: "new", label: "New File" },
        { value: "open", label: "Open..." },
        { value: "save", label: "Save" },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { value: "undo", label: "Undo" },
        { value: "redo", label: "Redo" },
        { value: "cut", label: "Cut" },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { value: "zoom-in", label: "Zoom In" },
        { value: "zoom-out", label: "Zoom Out" },
      ],
    },
  ]
</script>

<main class="menubar">
  <div {...api.getRootProps()} style="display: inline-flex; flex-direction: column; gap: 4px; width: 160px">
    {#each menus as m (m.id)}
      <MenubarMenu id={m.id} label={m.label} items={m.items} {positioning} />
    {/each}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
