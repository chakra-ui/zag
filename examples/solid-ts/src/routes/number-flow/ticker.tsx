import { TrendingDownIcon, TrendingUpIcon } from "lucide-solid"
import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import { NumberFlow } from "~/components/number-flow"
import "@styles/number-flow.css"

const OPEN = 182.4

export default function Page() {
  const [price, setPrice] = createSignal(OPEN)
  const [running, setRunning] = createSignal(true)

  // Random walk around the opening price
  createEffect(() => {
    if (!running()) return
    const id = setInterval(() => {
      setPrice((p) => Math.max(1, +(p + (Math.random() - 0.5) * 4).toFixed(2)))
    }, 1500)
    onCleanup(() => clearInterval(id))
  })

  const change = () => (price() - OPEN) / OPEN
  const direction = () => (change() >= 0 ? "up" : "down")

  return (
    <main class="number-flow">
      <div class="nf-card">
        <span class="nf-card-title">ZAG · Zag Industries</span>
        <div class="nf-ticker">
          <NumberFlow value={price()} formatOptions={{ style: "currency", currency: "USD" }} />
          <span class="nf-change" data-direction={direction()}>
            <Show when={direction() === "up"} fallback={<TrendingDownIcon />}>
              <TrendingUpIcon />
            </Show>
            <NumberFlow
              value={change()}
              formatOptions={{ style: "percent", minimumFractionDigits: 2, signDisplay: "always" }}
            />
          </span>
        </div>
      </div>

      <button onClick={() => setRunning((r) => !r)}>{running() ? "Pause" : "Resume"}</button>
    </main>
  )
}
