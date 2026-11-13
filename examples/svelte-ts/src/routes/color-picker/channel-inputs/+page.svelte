<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const formats = [
    { value: "rgba", label: "RGBA", channels: ["red", "green", "blue", "alpha"] },
    { value: "hsla", label: "HSLA", channels: ["hue", "saturation", "lightness", "alpha"] },
    { value: "hsba", label: "HSBA", channels: ["hue", "saturation", "brightness", "alpha"] },
  ] as const

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    inline: true,
    defaultFormat: "hsla",
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
  const channels = $derived(formats.find((format) => format.value === api.format)?.channels ?? [])
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <div {...api.getContentProps()}>
      <div class="content__inner">
        <div {...api.getAreaProps()}>
          <div {...api.getAreaBackgroundProps()}></div>
          <div {...api.getAreaThumbProps()}></div>
        </div>

        <select {...api.getFormatSelectProps()}>
          {#each formats as format (format.value)}
            <option value={format.value}>{format.label}</option>
          {/each}
        </select>

        <div class="color-picker-channel-inputs">
          {#each channels as channel (channel)}
            <label>
              {channel}
              <input {...api.getChannelInputProps({ channel })} />
            </label>
          {/each}
        </div>

        <input {...api.getChannelInputProps({ channel: "hex" })} />
        <output aria-label="Color value">{api.valueAsString}</output>
      </div>
    </div>
  </div>
</main>
