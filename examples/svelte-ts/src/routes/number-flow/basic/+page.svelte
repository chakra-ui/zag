<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as numberFlow from "@zag-js/number-flow"
  import { numberFlowControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { MinusIcon, PlusIcon } from "lucide-svelte"
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
        animations.started++
      },
      onAnimationComplete() {
        animations.completed++
      },
    }),
  )

  const api = $derived(numberFlow.connect(service, normalizeProps))

  const randomDelta = () => Math.round(Math.random() * 900 + 1)
</script>

<main class="number-flow">
  <div {...api.getRootProps()} class="nf-hero">
    <!-- Keyed by place so an update doesn't recreate a digit mid-roll -->
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

  <div class="hstack">
    <button class="nf-stepper" aria-label="Decrement" onclick={() => api.setValue(api.value - randomDelta())}>
      <MinusIcon />
    </button>
    <button class="nf-stepper" aria-label="Increment" onclick={() => api.setValue(api.value + randomDelta())}>
      <PlusIcon />
    </button>
    <button onclick={() => api.setValue(Math.round(Math.random() * 99999))}>Randomize</button>
    <button onclick={() => api.setValue(0)}>Reset</button>
  </div>

  <p class="nf-caption" data-testid="animations">
    animations: {animations.started} started / {animations.completed} completed
  </p>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
