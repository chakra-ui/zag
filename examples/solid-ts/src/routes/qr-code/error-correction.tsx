import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import "@styles/qr-code.css"

type Ecc = "L" | "M" | "Q" | "H"

const levels: { ecc: Ecc; recovery: string }[] = [
  { ecc: "L", recovery: "~7% recoverable" },
  { ecc: "M", recovery: "~15% recoverable" },
  { ecc: "Q", recovery: "~25% recoverable" },
  { ecc: "H", recovery: "~30% recoverable" },
]

// Higher levels add redundancy: the same value needs more modules
function Level(props: { ecc: Ecc; recovery: string }) {
  const service = useMachine(qrCode.machine, {
    id: createUniqueId(),
    value: "https://zagjs.com",
    encoding: { ecc: props.ecc },
  })

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <div class="qr-tile">
      <div {...api().getRootProps()} style={{ "--qr-size": "120px" }}>
        <svg {...api().getFrameProps()}>
          <path {...api().getPatternProps()} />
        </svg>
      </div>
      <strong>Level {props.ecc}</strong>
      <span>{props.recovery}</span>
    </div>
  )
}

export default function Page() {
  return (
    <main class="qr-code">
      <div class="hstack gap-5">
        <For each={levels}>{(level) => <Level ecc={level.ecc} recovery={level.recovery} />}</For>
      </div>
    </main>
  )
}
