<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { PipetteIcon } from "lucide-svelte"
  import "@styles/color-picker.css"

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    name: "color",
    defaultValue: colorPicker.parse("#f97316"),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Text color: <span {...api.getValueTextProps()}>{api.valueAsString}</span>
    </label>

    <div {...api.getControlProps()}>
      <div class="color-picker-swatch-preview">
        <div {...api.getTransparencyGridProps({ size: "8px" })}></div>
        <div {...api.getSwatchProps({ value: api.value })}></div>
      </div>
      <input {...api.getChannelInputProps({ channel: "hex" })} />
      <button {...api.getEyeDropperTriggerProps()}>
        <PipetteIcon size={16} />
      </button>
    </div>
  </div>
</main>
