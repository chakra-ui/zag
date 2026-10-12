<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  const items: steps.StepItem[] = [
    { value: "shipping", title: "Shipping" },
    { value: "payment", title: "Payment" },
    { value: "review", title: "Review" },
  ]

  let value = $state<string>(items[0].value)
  let finished = $state<string[] | null>(null)

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    value,
    onValueChange(details) {
      if (details.value) value = details.value
    },
    onComplete(details) {
      finished = details.completedValues
    },
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
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

    <div {...api.getContentProps({ value: steps.COMPLETE })}>All done 🎉</div>

    <div>
      <button {...api.getPrevTriggerProps()}>Back</button>
      <button {...api.getNextTriggerProps()}>Next</button>
    </div>
  </div>

  <hr style="margin: 2rem 0" />

  <p>
    External state: <code>{value === steps.COMPLETE ? "complete" : value}</code>, onComplete:
    <code>{finished ? finished.join(",") : "-"}</code>
  </p>
  <div style="display: flex; gap: 0.5rem">
    {#each items as item (item.value)}
      <button onclick={() => (value = item.value)}>Go to {item.title}</button>
    {/each}
    <button onclick={() => (value = steps.COMPLETE)}>Show completed</button>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
