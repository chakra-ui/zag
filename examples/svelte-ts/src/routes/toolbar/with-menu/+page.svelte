<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import ControlsPanel from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
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
      More actions <span {...menuApi.getIndicatorProps()}>▾</span>
    </button>
    {#if menuApi.open}
      <Portal>
        <div {...menuApi.getPositionerProps()}>
          <ul {...menuApi.getContentProps()}>
            <li {...menuApi.getItemProps({ value: "help" })}>Help</li>
            <li {...menuApi.getItemProps({ value: "shortcuts" })}>Keyboard Shortcuts</li>
            <li {...menuApi.getItemProps({ value: "release-notes" })}>Release Notes</li>
          </ul>
        </div>
      </Portal>
    {/if}
  </div>
  <p>
    Open the menu and use arrow keys — they navigate menu items, not the toolbar. Closing the menu returns roving focus
    to the toolbar.
  </p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>
