<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "hours",
    defaultValue: [9, 17],
    min: 0,
    max: 24,
    minStepsBetweenThumbs: 4,
    thumbSize: 20,
    "aria-label": ["Start hour", "End hour"],
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Opening hours</label>
    <output {...api.getValueTextProps()}>
      {api.value[0]}:00 – {api.value[1]}:00
    </output>
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
  <p class="slider-hint">Open at least 4 hours</p>
</main>
