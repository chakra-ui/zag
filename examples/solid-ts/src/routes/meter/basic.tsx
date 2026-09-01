import * as meter from "@zag-js/meter"
import { meterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/meter.css"

const presets = [
  { value: 10, label: "10%" },
  { value: 70, label: "70%" },
  { value: 95, label: "95%" },
]

export default function Page() {
  const controls = useControls(meterControls)

  const service = useMachine(
    meter.machine,
    controls.mergeProps<meter.Props>({
      id: createUniqueId(),
      defaultValue: 70,
      low: 60,
      high: 85,
      optimum: 10,
    }),
  )

  const api = createMemo(() => meter.connect(service, normalizeProps))

  return (
    <>
      <main class="meter">
        <div {...api().getRootProps()}>
          <div style={{ display: "flex", "justify-content": "space-between", "align-items": "baseline" }}>
            <span {...api().getLabelProps()}>Storage used</span>
            <span {...api().getValueTextProps()}>
              {api().valueAsString} · {api().valueState}
            </span>
          </div>
          <div {...api().getTrackProps()}>
            <div {...api().getIndicatorProps()} />
          </div>
        </div>

        <p>
          Optimum is below <code>low</code>, so a smaller value is better. 10 is optimal, 70 is suboptimal, 95 is
          least-optimal.
        </p>

        <div class="meter-actions">
          <For each={presets}>
            {({ value, label }) => (
              <button data-testid={`set-${value}`} type="button" onClick={() => api().setValue(value)}>
                Set {label}
              </button>
            )}
          </For>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
