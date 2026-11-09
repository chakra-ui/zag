<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  let submitted = $state("")

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    name: "color",
    required: true,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))

  function onsubmit(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    submitted = String(formData.get("color"))
  }
</script>

<main class="color-picker">
  <form {onsubmit} onreset={() => (submitted = "")}>
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Background color</label>
      <input {...api.getHiddenInputProps()} />

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
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 8px">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>

    <p>
      Submitted: <output aria-label="Submitted value">{submitted}</output>
    </p>
  </form>
</main>
