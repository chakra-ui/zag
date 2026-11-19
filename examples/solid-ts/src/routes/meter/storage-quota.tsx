import * as meter from "@zag-js/meter"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/meter.css"

const CAPACITY = 512
const BACKUPS = 128
const PHOTOS = 128

export default function Page() {
  const id = createUniqueId()
  const [used, setUsed] = createSignal(384)
  const [backupsDeleted, setBackupsDeleted] = createSignal(false)

  const service = useMachine(meter.machine, (): meter.Props => ({
    id,
    value: used(),
    max: CAPACITY,
    low: 300,
    high: 450,
    optimum: 0,
    formatOptions: { style: "unit", unit: "gigabyte", maximumFractionDigits: 0 },
    translations: {
      value: ({ value, max, formatter }) => `${formatter.format(value)} of ${formatter.format(max)}`,
    },
  }))
  const api = createMemo(() => meter.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="meter-storage-quota">
          <p class="hint">Free up space or upload files and watch the quota change state.</p>
          <div {...api().getRootProps()}>
            <div class="header">
              <span {...api().getLabelProps()}>Storage used</span>
              <span {...api().getValueTextProps()}>{api().valueAsString}</span>
            </div>
            <div {...api().getTrackProps()}>
              <div {...api().getIndicatorProps()} />
            </div>
          </div>
          <Show when={api().valueState === "least-optimal"}>
            <p class="alert" role="alert">
              Storage is full. New files won't sync.
            </p>
          </Show>
          <div class="meter-actions">
            <button
              type="button"
              disabled={backupsDeleted()}
              onClick={() => {
                setBackupsDeleted(true)
                setUsed((value) => value - BACKUPS)
              }}
            >
              Delete old backups ({BACKUPS} GB)
            </button>
            <button
              type="button"
              disabled={used() + PHOTOS > CAPACITY}
              onClick={() => setUsed((value) => value + PHOTOS)}
            >
              Upload photo library ({PHOTOS} GB)
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
