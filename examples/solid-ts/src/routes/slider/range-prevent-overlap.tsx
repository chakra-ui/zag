import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createUniqueId } from "solid-js"
import "@styles/slider.css"

export default function Page() {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "hours",
    defaultValue: [9, 17],
    min: 0,
    max: 24,
    minStepsBetweenThumbs: 4,
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Start hour" : "End hour"),
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Opening hours</label>
        <output {...api().getValueTextProps()}>
          {api().value[0]}:00 – {api().value[1]}:00
        </output>
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
      </div>
      <p class="slider-hint">Open at least 4 hours</p>
    </main>
  )
}
