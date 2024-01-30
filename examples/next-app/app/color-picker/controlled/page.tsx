"use client"

import { ColorPicker } from "@/components/color-picker"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Dialog Controlled</h1>

      <h1>{String(open)}</h1>

      <button
        type="button"
        onClick={() => {
          setOpen(true)
        }}
      >
        Open
      </button>

      <button
        type="button"
        onClick={() => {
          setOpen(false)
        }}
      >
        Close
      </button>

      <ColorPicker
        open={open}
        onOpenChange={({ open }) => {
          setOpen(open)
        }}
      />
    </div>
  )
}
