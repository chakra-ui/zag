<script lang="ts">
  import * as slider from "@zag-js/slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const service = useMachine(slider.machine, {
    thumbSize: 20,
    id: "1",
    name: "quantity",
    defaultValue: [10, 60],
  })

  const api = $derived(slider.connect(service, normalizeProps))
</script>

<div class="slider">
  <div {...api.getRootProps()}>
    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Quantity:</label>
      <output {...api.getValueTextProps()}>{api.value.join(" - ")}</output>
    </div>
    <div class="control-area">
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
  </div>
</div>
