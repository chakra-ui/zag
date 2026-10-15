<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { stepsControls, stepsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import "@styles/steps.css"

  const controls = useControls(stepsControls)

  const id = $props.id()
  const service = useMachine(
    steps.machine,
    controls.mergeProps<steps.Props>({
      id,
      items: stepsData,
    }),
  )

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      {#each stepsData as step, index (step.value)}
        {@const itemState = api.getItemState({ value: step.value })}
        <div {...api.getItemProps({ value: step.value })}>
          <button {...api.getTriggerProps({ value: step.value })}>
            <div {...api.getIndicatorProps({ value: step.value })}>{itemState.completed ? "✓" : index + 1}</div>
            <span>{step.title}</span>
          </button>
          <div {...api.getSeparatorProps({ value: step.value })}></div>
        </div>
      {/each}
    </div>

    {#each stepsData as step (step.value)}
      <div {...api.getContentProps({ value: step.value })}>
        {step.title} - {step.description}
      </div>
    {/each}

    <div {...api.getContentProps({ value: steps.COMPLETE })}>Steps Complete - Thank you for filling out the form!</div>

    <div>
      <button {...api.getPreviousTriggerProps()}>Back</button>
      <button {...api.getSkipTriggerProps()}>Skip</button>
      <button {...api.getNextTriggerProps()}>Next</button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
