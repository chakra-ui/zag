import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/progress.css"

// `null` means the amount of work is unknown
function Linear() {
  const service = useMachine(progress.machine, { id: createUniqueId(), defaultValue: null })
  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <span {...api().getLabelProps()}>Loading files</span>
      <div {...api().getTrackProps()}>
        <div {...api().getRangeProps()} />
      </div>
    </div>
  )
}

function Circular() {
  const service = useMachine(progress.machine, { id: createUniqueId(), defaultValue: null })
  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <span {...api().getLabelProps()}>Connecting</span>
      <svg {...api().getCircleProps()}>
        <circle {...api().getCircleTrackProps()} />
        <circle {...api().getCircleRangeProps()} />
      </svg>
    </div>
  )
}

export default function Page() {
  return (
    <main class="progress">
      <div class="vstack gap-8">
        <Linear />
        <Circular />
      </div>
    </main>
  )
}
