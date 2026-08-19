<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as numberFlow from "@zag-js/number-flow"
  import { numberFlowControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/number-flow.css"

  const PRESETS = {
    usd: {
      label: "USD Currency (en-US)",
      locale: "en-US",
      formatOptions: { style: "currency", currency: "USD" },
      step: 100,
      defaultValue: 1234.56,
    },
    eur: {
      label: "EUR Currency (de-DE)",
      locale: "de-DE",
      formatOptions: { style: "currency", currency: "EUR" },
      step: 100,
      defaultValue: 1234.56,
    },
    percent: {
      label: "Percent (en-US)",
      locale: "en-US",
      formatOptions: { style: "percent", minimumFractionDigits: 1 },
      step: 0.05,
      defaultValue: 0.256,
    },
    arabic: {
      label: "Arabic-Indic Digits (ar-EG)",
      locale: "ar-EG",
      formatOptions: {},
      step: 100,
      defaultValue: 1234,
    },
    plain: {
      label: "Grouped Plain (en-US)",
      locale: "en-US",
      formatOptions: {},
      step: 1000,
      defaultValue: 1234567,
    },
  } satisfies Record<
    string,
    { label: string; locale: string; formatOptions: Intl.NumberFormatOptions; step: number; defaultValue: number }
  >

  type PresetKey = keyof typeof PRESETS

  const controls = useControls(numberFlowControls)

  let preset = $state<PresetKey>("usd")
  let value = $state(PRESETS.usd.defaultValue)

  const current = $derived(PRESETS[preset])

  const id = $props.id()
  const service = useMachine(
    numberFlow.machine,
    controls.mergeProps<numberFlow.Props>({
      id,
      get value() {
        return value
      },
      get locale() {
        return current.locale
      },
      get formatOptions() {
        return current.formatOptions
      },
    }),
  )

  const api = $derived(numberFlow.connect(service, normalizeProps))

  function changePreset(next: PresetKey) {
    preset = next
    value = PRESETS[next].defaultValue
  }
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
    <select
      data-testid="preset"
      value={preset}
      onchange={(event) => changePreset((event.currentTarget as HTMLSelectElement).value as PresetKey)}
    >
      {#each Object.entries(PRESETS) as [key, item] (key)}
        <option value={key}>{item.label}</option>
      {/each}
    </select>
    <button data-testid="decrease" onclick={() => (value -= current.step)}>-{current.step}</button>
    <button data-testid="increase" onclick={() => (value += current.step)}>+{current.step}</button>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
