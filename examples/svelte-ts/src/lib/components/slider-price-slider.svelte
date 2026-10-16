<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "price",
    defaultValue: [20, 60],
    thumbSize: 20,
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>Price</label>
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
</div>
