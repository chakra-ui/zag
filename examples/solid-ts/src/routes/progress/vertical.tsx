import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/progress.css"

const levels = [
  { label: "CPU", value: 72 },
  { label: "RAM", value: 45 },
  { label: "Disk", value: 90 },
]

function Level(props: { label: string; value: number }) {
  const service = useMachine(progress.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    defaultValue: props.value,
  })

  const api = createMemo(() => progress.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <span {...api().getValueTextProps()}>{api().valueAsString}</span>
      <div {...api().getTrackProps()}>
        <div {...api().getRangeProps()} />
      </div>
      <span {...api().getLabelProps()}>{props.label}</span>
    </div>
  )
}

export default function Page() {
  return (
    <main class="progress">
      <div class="hstack gap-8">
        <For each={levels}>{(level) => <Level {...level} />}</For>
      </div>
    </main>
  )
}
