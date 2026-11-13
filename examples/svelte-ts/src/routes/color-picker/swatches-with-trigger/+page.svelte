<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { CheckIcon, PlusIcon } from "lucide-svelte"
  import "@styles/color-picker.css"

  let swatches = $state(["#EF4444", "#22C55E", "#3B82F6"])

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))

  function saveSwatch() {
    const color = api.value.toString("hex")
    if (!swatches.includes(color)) swatches.push(color)
  }
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Highlight: <span {...api.getValueTextProps()}>{api.valueAsString}</span>
    </label>

    <div {...api.getSwatchGroupProps()} class="color-picker-swatches">
      {#each swatches as swatch (swatch)}
        <button {...api.getSwatchTriggerProps({ value: swatch })} class="color-picker-swatch-button">
          <div {...api.getSwatchProps({ value: swatch })}></div>
          <span {...api.getSwatchIndicatorProps({ value: swatch })}>
            <CheckIcon size={16} />
          </span>
        </button>
      {/each}
      <button {...api.getTriggerProps()} class="color-picker-add-button">
        <PlusIcon size={16} />
      </button>
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

          <input {...api.getChannelInputProps({ channel: "hex" })} />

          <button type="button" onclick={saveSwatch}>Save</button>
        </div>
      </div>
    </div>
  </div>
</main>
