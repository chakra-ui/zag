<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "temperature",
    defaultValue: [21],
    min: 10,
    max: 30,
    thumbSize: 20,
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Temperature</label>
    <div {...api.getControlProps()}>
      <div {...api.getTrackProps()}>
        <div {...api.getRangeProps()}></div>
      </div>
      {#each api.value as _, index}
        <div {...api.getThumbProps({ index })}>
          <input {...api.getHiddenInputProps({ index })} />
        </div>
      {/each}
      <span {...api.getDraggingIndicatorProps({ index: 0 })}>{api.getThumbValue(0)}°C</span>
    </div>
  </div>
</main>
