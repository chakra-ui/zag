"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { NumberFlow } from "@/components/number-flow"
import "@styles/number-flow.css"

const OPEN = 182.4

export default function Page() {
  const [price, setPrice] = useState(OPEN)
  const [running, setRunning] = useState(true)

  // Random walk around the opening price
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setPrice((p) => Math.max(1, +(p + (Math.random() - 0.5) * 4).toFixed(2)))
    }, 1500)
    return () => clearInterval(id)
  }, [running])

  const change = (price - OPEN) / OPEN
  const direction = change >= 0 ? "up" : "down"

  return (
    <main className="number-flow">
      <div className="nf-card">
        <span className="nf-card-title">ZAG · Zag Industries</span>
        <div className="nf-ticker">
          <NumberFlow value={price} formatOptions={{ style: "currency", currency: "USD" }} />
          <span className="nf-change" data-direction={direction}>
            {direction === "up" ? <TrendingUpIcon /> : <TrendingDownIcon />}
            <NumberFlow
              value={change}
              formatOptions={{ style: "percent", minimumFractionDigits: 2, signDisplay: "always" }}
            />
          </span>
        </div>
      </div>

      <button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Resume"}</button>
    </main>
  )
}
