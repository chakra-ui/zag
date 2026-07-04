<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { mergeProps, normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import * as menu from "@zag-js/menu"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const menuService = useMachine(menu.machine, () => ({
    id: `${id}-menu`,
    ids: { trigger: api.getItemId("more") },
    onSelect: console.log,
  }))
  const menuApi = $derived(menu.connect(menuService, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>
    <div {...api.getSeparatorProps()}></div>
    <button {...mergeProps(menuApi.getTriggerProps(), api.getItemProps({ value: "more" }))}>
      More actions <span {...menuApi.getIndicatorProps()}>v</span>
    </button>
    {#if menuApi.open}
      <div use:portal {...menuApi.getPositionerProps()}>
        <ul {...menuApi.getContentProps()}>
          <li {...menuApi.getItemProps({ value: "help" })}>Help</li>
          <li {...menuApi.getItemProps({ value: "shortcuts" })}>Keyboard Shortcuts</li>
          <li {...menuApi.getItemProps({ value: "release-notes" })}>Release Notes</li>
        </ul>
      </div>
    {/if}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

