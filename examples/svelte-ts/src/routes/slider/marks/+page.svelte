<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"

  const marks = [
    { value: 0, label: "Low" },
    { value: 50, label: "Medium" },
    { value: 100, label: "High" },
  ]

  const id = $props.id()
  const service = useMachine(slider.machine, {
    id,
    name: "quality",
    defaultValue: [50],
    step: 50,
    thumbSize: 20,
    getAriaValueText: ({ value }) => marks.find((mark) => mark.value === value)?.label ?? String(value),
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Quality</label>
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
      {#each marks as mark (mark.value)}
        <span {...api.getMarkerProps({ value: mark.value })}>{mark.label}</span>
      {/each}
    </div>
  </div>
</main>
