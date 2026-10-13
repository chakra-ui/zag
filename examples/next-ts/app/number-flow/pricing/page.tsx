"use client"

import { useState } from "react"
import { NumberFlow } from "@/components/number-flow"
import "@styles/number-flow.css"

const plans = [
  { name: "Starter", monthly: 9, yearly: 90 },
  { name: "Pro", monthly: 29, yearly: 290 },
]

export default function Page() {
  const [yearly, setYearly] = useState(false)

  return (
    <main className="number-flow">
      <div className="nf-toggle" role="group" aria-label="Billing period">
        <button aria-pressed={!yearly} onClick={() => setYearly(false)}>
          Monthly
        </button>
        <button aria-pressed={yearly} onClick={() => setYearly(true)}>
          Yearly
        </button>
      </div>

      <div className="hstack gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="nf-card">
            <span className="nf-card-title">{plan.name}</span>
            <div className="nf-price">
              {/* The prefix stays put; only the digits roll */}
              <NumberFlow
                value={yearly ? plan.yearly : plan.monthly}
                formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
              />
              <small>/{yearly ? "year" : "month"}</small>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
