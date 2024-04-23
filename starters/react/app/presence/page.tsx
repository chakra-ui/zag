"use client"

import { Presence } from "@/components/presence"
import { useState } from "react"
import "./page.css"

export default function Page() {
  const [open, setOpen] = useState(true)
  const [unmounted, setUnmounted] = useState(false)

  return (
    <div className="main">
      <div>
        Open {String(open)}, Unmounted: {String(unmounted)}
      </div>
      <button
        onClick={() =>
          setOpen((prevOpen) => {
            setUnmounted(false)
            return !prevOpen
          })
        }
      >
        Toggle
      </button>
      <Presence present={open} keepMounted onExitComplete={() => setUnmounted(true)}>
        <div>Content</div>
      </Presence>
    </div>
  )
}
