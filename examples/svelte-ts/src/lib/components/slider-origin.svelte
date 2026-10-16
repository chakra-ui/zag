<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    label: string
    props: Partial<slider.Props>
    format: (value: number) => string
    marks?: number[]
  }

  let { label, props, format, marks }: Props = $props()

  const id = $props.id()
  const service = useMachine(slider.machine, () => ({
    id,
    thumbSize: 20,
    ...props,
  }))

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>{label}</label>
  <output {...api.getValueTextProps()}>{format(api.value[0])}</output>
  <div {...api.getControlProps()}>
    <div {...api.getTrackProps()}>
      <div {...api.getRangeProps()}></div>
    </div>
    {#each api.value as _, index}
      <div {...api.getThumbProps({ index })}>
        <input {...api.getHiddenInputProps({ index })} />
      </div>
    {/each}
  </div>
  {#if marks}
    <div {...api.getMarkerGroupProps()}>
      {#each marks as value (value)}
        <span {...api.getMarkerProps({ value })}>{value > 0 ? `+${value}` : value}</span>
      {/each}
    </div>
  {/if}
</div>
