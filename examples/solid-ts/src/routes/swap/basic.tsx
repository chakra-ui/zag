import { createSignal } from "solid-js"
import { Swap } from "~/components/swap"
import "@styles/swap.css"

export default function Page() {
  const [muted, setMuted] = createSignal(false)

  return (
    <main class="swap">
      <button onClick={() => setMuted((c) => !c)}>
        <Swap open={muted()} fallback={<div>Unmuted</div>}>
          <div>Muted</div>
        </Swap>
      </button>
    </main>
  )
}
