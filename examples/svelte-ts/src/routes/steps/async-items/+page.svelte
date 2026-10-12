<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  const remoteItems: steps.StepItem[] = [
    { value: "profile", title: "Profile" },
    { value: "team", title: "Team" },
    { value: "billing", title: "Billing", optional: true },
    { value: "done", title: "Done" },
  ]

  let items = $state<steps.StepItem[]>([])

  $effect(() => {
    const timer = setTimeout(() => (items = remoteItems), 1500)
    return () => clearTimeout(timer)
  })

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    {#if items.length === 0}
      <p>Loading steps…</p>
    {/if}

    <div {...api.getListProps()}>
      {#each items as item, index (item.value)}
        <div {...api.getItemProps({ value: item.value })}>
          <button {...api.getTriggerProps({ value: item.value })}>
            <div {...api.getIndicatorProps({ value: item.value })}>{index + 1}</div>
            <span>{item.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    {#each items as item (item.value)}
      <div {...api.getContentProps({ value: item.value })}>{item.title} content</div>
    {/each}

    <div {...api.getContentProps({ value: steps.COMPLETE })}>All set 🎉</div>

    <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
      <button {...api.getPrevTriggerProps()}>Back</button>
      <button {...api.getNextTriggerProps()}>Next</button>
      <button onclick={() => (items = [])}>Clear items</button>
      <button onclick={() => (items = remoteItems.map((item) => ({ ...item, disabled: true })))}>Disable all</button>
      <button onclick={() => (items = remoteItems)}>Restore items</button>
    </div>

    <p style="margin-top: 1rem">
      While no item is navigable the value is <code>{String(api.value)}</code> and navigation is inert. Clearing the items
      mid-flow moves the value to the nearest surviving step instead of throwing.
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
