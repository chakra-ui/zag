<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const marks = [0, 25, 50, 75, 100]

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "quantity",
    defaultValue: [20, 60],
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum quantity" : "Maximum quantity"),
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Quantity</label>
    <output {...api.getValueTextProps()}>{api.value.join(" – ")}</output>
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
    <div {...api.getMarkerGroupProps()}>
      {#each marks as value (value)}
        <span {...api.getMarkerProps({ value })}>{value}</span>
      {/each}
    </div>
  </div>
</main>
