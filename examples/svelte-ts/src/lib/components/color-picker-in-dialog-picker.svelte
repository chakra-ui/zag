<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    name: "color",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.getLabelProps()}>Select Color</label>
  <div {...api.getControlProps()}>
    <input {...api.getHiddenInputProps()} />
    <button {...api.getTriggerProps()}>
      <div style="position: relative">
        <div {...api.getTransparencyGridProps({ size: "4px" })}></div>
        <div {...api.getSwatchProps({ value: api.value })}></div>
      </div>
    </button>
  </div>

  {#if api.open}
    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div class="content__inner">
            <div {...api.getAreaProps()}>
              <div {...api.getAreaBackgroundProps()}></div>
              <div {...api.getAreaThumbProps()}></div>
            </div>

            <div {...api.getChannelSliderProps({ channel: "hue" })}>
              <div {...api.getChannelSliderTrackProps({ channel: "hue" })}></div>
              <div {...api.getChannelSliderThumbProps({ channel: "hue" })}></div>
            </div>

            <div {...api.getChannelSliderProps({ channel: "alpha" })}>
              <div {...api.getTransparencyGridProps({ size: "12px" })}></div>
              <div {...api.getChannelSliderTrackProps({ channel: "alpha" })}></div>
              <div {...api.getChannelSliderThumbProps({ channel: "alpha" })}></div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  {/if}
</div>
