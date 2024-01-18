"use client"

import { Dialog } from "@/components/dialog"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px" }}>
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

      <Dialog
        open={open}
        onOpenChange={({ open }) => {
          setOpen(open)
        }}
      />
    </div>
  )
}
