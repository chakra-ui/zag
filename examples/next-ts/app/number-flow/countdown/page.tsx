"use client"

import { useEffect, useState } from "react"
import { NumberFlow } from "@/components/number-flow"
import "@styles/number-flow.css"

const START = 90 * 60

const twoDigits = { minimumIntegerDigits: 2 }

export default function Page() {
  const [seconds, setSeconds] = useState(START)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  const units = [
    { label: "Hours", value: Math.floor(seconds / 3600) },
    { label: "Minutes", value: Math.floor((seconds % 3600) / 60) },
    { label: "Seconds", value: seconds % 60 },
  ]

  return (
    <main className="number-flow">
      <div className="nf-countdown" role="timer">
        {units.map((unit, index) => (
          <div key={unit.label} className="hstack gap-1 items-start">
            {index > 0 && <span className="nf-colon">:</span>}
            <div className="nf-unit">
              {/* trend -1: digits always roll downward, like a clock counting down */}
              <NumberFlow value={unit.value} formatOptions={twoDigits} trend={-1} />
              <small>{unit.label}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="hstack">
        <button onClick={() => setRunning((r) => !r)}>{running ? "Pause" : "Start"}</button>
        <button onClick={() => setSeconds(START)}>Reset</button>
      </div>
    </main>
  )
}
