<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { tabsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tabs from "@zag-js/tabs"
  import "@styles/tabs.css"

  let disabled = $state(false)
  let addedTabs = $state<typeof tabsData>([])
  const items = $derived([...tabsData, ...addedTabs])

  const id = $props.id()
  const service = useMachine(tabs.machine, {
    id,
    defaultValue: "nils",
  })

  const api = $derived(tabs.connect(service, normalizeProps))

  function addTab() {
    const n = addedTabs.length + 1
    const tab = { id: `tab-${n}`, label: `Tab ${n}`, content: `Content of tab ${n}` }
    addedTabs = [...addedTabs, tab]
    api.setValue(tab.id)
  }
</script>

<main class="tabs">
  <div {...api.getRootProps()}>
    <div {...api.getIndicatorProps()}></div>
    <div {...api.getListProps()}>
      {#each items as data (data.id)}
        <button
          {...api.getTriggerProps({ value: data.id, disabled: data.id === "nils" && disabled })}
          data-testid={`${data.id}-tab`}
        >
          {data.label}
        </button>
      {/each}
    </div>

    {#each items as data (data.id)}
      <div {...api.getContentProps({ value: data.id })} data-testid={`${data.id}-tab-panel`}>
        <p>{data.content}</p>
      </div>
    {/each}
  </div>
  <label>
    <input type="checkbox" data-testid="disable-selected" bind:checked={disabled} />
    Disable the selected tab
  </label>
  <button onclick={addTab}>Add a tab</button>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["value", "tabStopValue"]} />
</Toolbar>
