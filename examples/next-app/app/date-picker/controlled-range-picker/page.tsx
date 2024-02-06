"use client"

import { DateRangePicker } from "@/components/date-range-picker"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>DateRange Picker Controlled</h1>

      <h1>{String(open)}</h1>

      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>

      <button type="button" onClick={() => setOpen(false)}>
        Close
      </button>

      <DateRangePicker open={open} onOpenChange={({ open }) => setOpen(open)} />
    </div>
  )
}
