<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "frequency",
    defaultValue: [440],
    min: 20,
    max: 20000,
    thumbSize: 20,
    scale: "log",
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Frequency</label>
    <output {...api.getValueTextProps()}>{api.getThumbValue(0)} Hz</output>
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
</main>
