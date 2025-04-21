<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { tabsControls, tabsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"

  const controls = useControls(tabsControls)

  const id = $props.id()
  const service = useMachine(tabs.machine, {
    id,
    defaultValue: "nils",
  })

  const api = $derived(tabs.connect(service, normalizeProps))
</script>

<main class="tabs">
  <div {...api.getRootProps()}>
    <div {...api.getIndicatorProps()}></div>
    <div {...api.getListProps()}>
      {#each tabsData as data}
        <button {...api.getTriggerProps({ value: data.id })} data-testid={`${data.id}-tab`}>
          {data.label}
        </button>
      {/each}
    </div>

    {#each tabsData as data}
      <div {...api.getContentProps({ value: data.id })} data-testid={`${data.id}-tab-panel`}>
        <p>{data.content}</p>
        {#if data.id === "agnes"}
          <input placeholder="Agnes" />
        {/if}
      </div>
    {/each}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
