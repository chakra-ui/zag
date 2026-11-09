<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon } from "lucide-svelte"
  import "@styles/color-picker.css"

  const swatches = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#6366f1",
    "#a855f7",
    "#ec4899",
    "#64748b",
  ]

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    name: "color",
    defaultValue: colorPicker.parse("#3b82f6"),
    closeOnSelect: true,
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Brand color</label>

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <div {...api.getTransparencyGridProps({ size: "10px" })}></div>
        <div {...api.getSwatchProps({ value: api.value })}></div>
      </button>
      <input {...api.getChannelInputProps({ channel: "hex" })} />
    </div>

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

          <div {...api.getSwatchGroupProps()} class="color-picker-swatches">
            {#each swatches as swatch (swatch)}
              <button {...api.getSwatchTriggerProps({ value: swatch })} class="color-picker-swatch-button">
                <div {...api.getSwatchProps({ value: swatch })}></div>
                <span {...api.getSwatchIndicatorProps({ value: swatch })}>
                  <CheckIcon size={16} />
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
