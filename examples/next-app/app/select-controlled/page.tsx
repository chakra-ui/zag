"use client"

import { useState } from "react"
import { Select, items } from "../../components/select"

export default function Page() {
  const [value, setValue] = useState<string | null | undefined>(null)

  return (
    <div style={{ padding: "40px" }}>
      <h1>{value}</h1>

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

      <Select value={value} setValue={setValue} />
    </div>
  )
}
