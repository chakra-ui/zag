import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, Show, createMemo, createUniqueId } from "solid-js"
import "@styles/slider.css"

interface OriginSliderProps {
  label: string
  props: Partial<slider.Props>
  format: (value: number) => string
  marks?: number[]
}

function OriginSlider(props: OriginSliderProps) {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    thumbSize: 20,
    ...props.props,
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <label {...api().getLabelProps()}>{props.label}</label>
      <output {...api().getValueTextProps()}>{props.format(api().value[0])}</output>
      <div {...api().getControlProps()}>
        <div {...api().getTrackProps()}>
          <div {...api().getRangeProps()} />
        </div>
        <Index each={api().value}>
          {(_, index) => (
            <div {...api().getThumbProps({ index })}>
              <input {...api().getHiddenInputProps({ index })} />
            </div>
          )}
        </Index>
      </div>
      <Show when={props.marks}>
        {(marks) => (
          <div {...api().getMarkerGroupProps()}>
            <For each={marks()}>
              {(value) => <span {...api().getMarkerProps({ value })}>{value > 0 ? `+${value}` : value}</span>}
            </For>
          </div>
        )}
      </Show>
    </div>
  )
}

export default function Page() {
  return (
    <main>
      <div class="vstack gap-8">
        <OriginSlider
          label="Balance"
          props={{ name: "balance", origin: "center", min: -50, max: 50, defaultValue: [20] }}
          format={(value) => (value === 0 ? "Center" : `${value < 0 ? "L" : "R"} ${Math.abs(value)}`)}
        />
        <OriginSlider
          label="Exposure"
          props={{ name: "exposure", origin: 0, min: -3, max: 1, step: 0.1, defaultValue: [-1.5] }}
          format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)} EV`}
          marks={[-3, -2, -1, 0, 1]}
        />
        <OriginSlider
          label="Fade out"
          props={{ name: "fade-out", origin: "end", defaultValue: [70] }}
          format={(value) => `${100 - value}%`}
        />
      </div>
    </main>
  )
}
