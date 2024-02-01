"use client"

import { useState } from "react"
import { Select, items } from "@/components/select"

/**
 * This page tests that controlling the select should work
 */

export default function Page() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null | undefined>(null)

  return (
    <div style={{ padding: "40px" }}>
      <h1>{value || "-"}</h1>
      <div style={{ display: "flex", gap: "40px", marginBottom: "24px" }}>
        <button
          onClick={() => {
            setValue(items[0].value)
          }}
        >
          Change to {items[0].label}
        </button>

        <button
          onClick={() => {
            setValue(items[1].value)
          }}
        >
          Change to {items[1].label}
        </button>
      </div>

      <Select open={open} onOpenChange={({ open }) => setOpen(open)} value={value} onValueChange={setValue} />
    </div>
  )
}
