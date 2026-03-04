<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <div>
    <p>Use a screen reader to navigate to the menu.</p>
    <button {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>
    <div use:portal {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <a {...api.getItemProps({ value: "edit" })} href="https://google.com"> Google </a>
        <a {...api.getItemProps({ value: "duplicate" })} href="https://bing.com"> Bing </a>
        <a {...api.getItemProps({ value: "delete" })} href="https://github.com" target="_blank"> GitHub </a>
        <a {...api.getItemProps({ value: "export" })} href="https://youtube.com" target="_blank"> YouTube </a>
      </div>
    </div>
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} />
</Toolbar>
