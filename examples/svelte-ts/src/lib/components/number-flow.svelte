<script lang="ts">
  import * as numberFlow from "@zag-js/number-flow"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props extends Omit<numberFlow.Props, "id"> {
    class?: string
  }

  const { class: className, ...machineProps }: Props = $props()

  const id = $props.id()
  const service = useMachine(numberFlow.machine, () => ({ id, ...machineProps }))
  const api = $derived(numberFlow.connect(service, normalizeProps))
</script>

<span {...api.getRootProps()} class={className}>
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
</span>
