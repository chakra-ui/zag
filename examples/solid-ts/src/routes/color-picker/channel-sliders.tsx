import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/color-picker.css"

const sliders = [
  { channel: "hue", label: "Hue" },
  { channel: "alpha", label: "Alpha" },
] as const

export default function Page() {
  const controls = useControls(colorPickerControls)

  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id: createUniqueId(),
      name: "color",
      defaultValue: colorPicker.parse("hsla(210, 90%, 55%, 0.8)"),
      inline: true,
    }),
  )

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <>
      <main class="color-picker">
        <div {...api().getRootProps()}>
          <div {...api().getContentProps()} class="channel-sliders">
            <div class="channel-sliders__preview">
              <div class="channel-sliders__swatch">
                <div {...api().getTransparencyGridProps({ size: "8px" })} />
                <div {...api().getSwatchProps({ value: api().value })} />
              </div>
              <div class="channel-sliders__value">
                <span {...api().getValueTextProps()}>{api().valueAsString}</span>
                <input {...api().getChannelInputProps({ channel: "hex" })} />
              </div>
            </div>

            <For each={sliders}>
              {({ channel, label }) => (
                <div class="channel-sliders__field">
                  <div class="channel-sliders__header">
                    <label {...api().getChannelSliderLabelProps({ channel })}>{label}</label>
                    <span {...api().getChannelSliderValueTextProps({ channel })}>
                      {api().value.toFormat("hsla").formatChannelValue(channel, "en-US")}
                    </span>
                  </div>
                  <div {...api().getChannelSliderProps({ channel })}>
                    <Show when={channel === "alpha"}>
                      <div {...api().getTransparencyGridProps({ size: "10px" })} />
                    </Show>
                    <div {...api().getChannelSliderTrackProps({ channel })} />
                    <div {...api().getChannelSliderThumbProps({ channel })} />
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
