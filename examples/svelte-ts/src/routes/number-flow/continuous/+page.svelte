<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as numberFlow from "@zag-js/number-flow"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/number-flow.css"

  let value = $state(0)
  let continuous = $state(true)
  let playing = $state(true)

  $effect(() => {
    if (!playing) return
    const id = setInterval(() => (value += Math.round(Math.random() * 45 + 5)), 900)
    return () => clearInterval(id)
  })

  const id = $props.id()
  const service = useMachine(numberFlow.machine, {
    id,
    get value() {
      return value
    },
    get continuous() {
      return continuous
    },
    spinTiming: { duration: "800ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  })

  const api = $derived(numberFlow.connect(service, normalizeProps))
</script>

<main class="number-flow">
  <div {...api.getRootProps()}>
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
    <button onclick={() => (playing = !playing)}>{playing ? "Pause" : "Play"}</button>
    <button onclick={() => (value = 0)}>Reset</button>
    <label>
      <input type="checkbox" bind:checked={continuous} />
      continuous (spin through intermediates)
    </label>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
