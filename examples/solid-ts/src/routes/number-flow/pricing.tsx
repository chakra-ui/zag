import { createSignal, For } from "solid-js"
import { NumberFlow } from "~/components/number-flow"
import "@styles/number-flow.css"

const plans = [
  { name: "Starter", monthly: 9, yearly: 90 },
  { name: "Pro", monthly: 29, yearly: 290 },
]

export default function Page() {
  const [yearly, setYearly] = createSignal(false)

  return (
    <main class="number-flow">
      <div class="nf-toggle" role="group" aria-label="Billing period">
        <button aria-pressed={!yearly()} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button aria-pressed={yearly()} onClick={() => setYearly(true)}>
          Yearly
        </button>
      </div>

      <div class="hstack gap-4">
        <For each={plans}>
          {(plan) => (
            <div class="nf-card">
              <span class="nf-card-title">{plan.name}</span>
              <div class="nf-price">
                {/* The prefix stays put; only the digits roll */}
                <NumberFlow
                  value={yearly() ? plan.yearly : plan.monthly}
                  formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                />
                <small>/{yearly() ? "year" : "month"}</small>
              </div>
            </div>
          )}
        </For>
      </div>
    </main>
  )
}
