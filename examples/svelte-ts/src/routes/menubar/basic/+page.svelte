<script lang="ts">
  import { page } from "$app/state"
  import MenubarMenu from "#lib/components/menubar-menu.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import type * as menu from "@zag-js/menu"
  import * as menubar from "@zag-js/menubar"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { setContext } from "svelte"
  import "@styles/menu.css"

  const disabled = page.url.searchParams.get("disabled") === "true"

  const id = $props.id()
  const service = useMachine(menubar.machine, { id, disabled })
  const api = $derived(menubar.connect(service, normalizeProps))

  setContext<menu.MenubarContext>("menubar", api.getMenuContext())

  const menus = [
    {
      id: "file",
      label: "File",
      items: [
        { value: "new", label: "New File" },
        { value: "open", label: "Open..." },
        { value: "save", label: "Save" },
        { value: "save-as", label: "Save As..." },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        { value: "undo", label: "Undo" },
        { value: "redo", label: "Redo" },
        { value: "cut", label: "Cut" },
        { value: "copy", label: "Copy" },
        { value: "paste", label: "Paste" },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        { value: "zoom-in", label: "Zoom In" },
        { value: "zoom-out", label: "Zoom Out" },
        { value: "fullscreen", label: "Toggle Fullscreen" },
      ],
    },
  ]
</script>

<main class="menubar">
  <div {...api.getRootProps()} style="display: inline-flex; gap: 4px">
    {#each menus as m (m.id)}
      <MenubarMenu
        id={m.id}
        label={m.label}
        items={m.items}
        onSelect={({ value }) => console.log(`[${m.label}]`, value)}
      />
    {/each}
  </div>
  <p style="margin-top: 24px">hasOpenMenu: {String(api.hasOpenMenu)}</p>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
