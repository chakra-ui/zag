<script lang="ts">
  import * as steps from "@zag-js/steps"
  import { stepsControls, stepsData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(stepsControls)

  const id = $props.id()
  const service = useMachine(steps.machine, { id, count: stepsData.length })

  const api = $derived(steps.connect(service, normalizeProps))
</script>

<main class="steps">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      {#each stepsData as step, index}
        <div {...api.getItemProps({ index })}>
          <button {...api.getTriggerProps({ index })}>
            <div {...api.getIndicatorProps({ index })}>{index + 1}</div>
            <span>{step.title}</span>
          </button>
          <div {...api.getSeparatorProps({ index })}></div>
        </div>
      {/each}
    </div>

    {#each stepsData as step, index}
      <div {...api.getContentProps({ index })}>
        {step.title} - {step.description}
      </div>
    {/each}

    <div {...api.getContentProps({ index: stepsData.length })}>
      Steps Complete - Thank you for filling out the form!
    </div>

    <div>
      <button {...api.getPrevTriggerProps()}>Back</button>
      <button {...api.getNextTriggerProps()}>Next</button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
