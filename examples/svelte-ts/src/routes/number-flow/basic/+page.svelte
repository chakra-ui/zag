<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as numberFlow from "@zag-js/number-flow"
  import { numberFlowControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/number-flow.css"

  const controls = useControls(numberFlowControls)

  let animations = $state({ started: 0, completed: 0 })

  const id = $props.id()
  const service = useMachine(
    numberFlow.machine,
    controls.mergeProps<numberFlow.Props>({
      id,
      defaultValue: 1234,
      onAnimationStart() {
        animations = { ...animations, started: animations.started + 1 }
      },
      onAnimationComplete() {
        animations = { ...animations, completed: animations.completed + 1 }
      },
    }),
  )

  const api = $derived(numberFlow.connect(service, normalizeProps))

  const randomDelta = () => Math.round(Math.random() * 900 + 1)
</script>

<main class="number-flow">
  <div {...api.getRootProps()}>
    <!-- Keyed by place: every update rebuilds the segment objects, and an unkeyed `each` would
         recreate each digit's DOM and drop the roll it was mid-way through. -->
    {#each api.segments as segment (segment.key)}
      {#if segment.kind === "digit"}
        <span {...api.getDigitProps({ segment })}>
          <span {...api.getDigitTrackProps({ segment })}>
            {#each api.digitCells as cell (cell.index)}<span {...api.getDigitCellProps({ segment, cell })}
                >{cell.glyph}</span
              >{/each}
          </span>
        </span>
      {:else}
        <span {...api.getSymbolProps({ segment })}>{segment.value}</span>
      {/if}
    {/each}
    <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
  </div>

  <div class="number-flow__actions">
    <button onclick={() => api.setValue(api.value - randomDelta())}>Decrement</button>
    <button onclick={() => api.setValue(api.value + randomDelta())}>Increment</button>
    <button onclick={() => api.setValue(Math.round(Math.random() * 99999))}>Randomize</button>
    <button onclick={() => api.setValue(0)}>Reset</button>
    <span class="number-flow__value" data-testid="value">
      value: {api.value}
      {api.animating ? "(rolling)" : ""}
    </span>
    <span class="number-flow__value" data-testid="animations">
      animations: {animations.started} started / {animations.completed} completed
    </span>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
