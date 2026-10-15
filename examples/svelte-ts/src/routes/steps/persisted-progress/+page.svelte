<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/steps.css"

  const STORAGE_KEY = "zag:steps-progress"

  const items: steps.StepItem[] = [
    { value: "domain", title: "Connect domain", description: "Point your DNS to us" },
    { value: "branding", title: "Branding", description: "Logo and colors" },
    { value: "payouts", title: "Payouts", description: "Where we send money" },
    { value: "review", title: "Review", description: "Check and launch" },
  ]

  interface Progress {
    value: string | null
    completedValues: string[]
  }

  const load = (): Progress => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
      if (saved) return saved
    } catch {}
    return { value: items[0].value, completedValues: [] }
  }

  // Empty until storage is read, so the server render matches the client
  let progress = $state<Progress>({ value: null, completedValues: [] })

  onMount(() => {
    progress = load()
  })

  const save = (patch: Partial<Progress>) => {
    progress = { ...progress, ...patch }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {}
  }

  const id = $props.id()
  const service = useMachine(steps.machine, () => ({
    id,
    items,
    linear: true,
    orientation: "vertical" as const,
    value: progress.value ?? undefined,
    completedValues: progress.completedValues,
    onValueChange: ({ value }) => save({ value }),
    onCompletedChange: ({ completedValues }) => save({ completedValues }),
  }))

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      {#each api.items as item, index (item.value)}
        {@const itemState = api.getItemState({ value: item.value })}
        <div {...api.getItemProps({ value: item.value })}>
          <button {...api.getTriggerProps({ value: item.value })}>
            <div {...api.getIndicatorProps({ value: item.value })}>{itemState.completed ? "✓" : index + 1}</div>
            <span>
              {item.title}
              <br />
              <small>{item.description}</small>
            </span>
          </button>
          <div {...api.getSeparatorProps({ value: item.value })}></div>
        </div>
      {/each}
    </div>

    <div style="flex: 1">
      {#each items as item (item.value)}
        <div {...api.getContentProps({ value: item.value })}>
          <h3>{item.title}</h3>
          <p>{item.description}. Your progress is saved, so you can leave and pick up here later.</p>
        </div>
      {/each}

      <div {...api.getContentProps({ value: steps.COMPLETE })}>
        <h3>Your store is live</h3>
      </div>

      <div class="steps-actions">
        <button {...api.getPreviousTriggerProps()}>Back</button>
        {#if !api.complete}
          <button {...api.getNextTriggerProps()}>{api.canComplete ? "Launch" : "Next"}</button>
        {/if}
        <button onclick={() => api.resetStep()}>Reset progress</button>
      </div>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
