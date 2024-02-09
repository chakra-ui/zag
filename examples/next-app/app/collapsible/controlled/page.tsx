"use client"

import { Collapsible } from "@/components/collapsible"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Collapsible Controlled</h1>

      <h1>{String(open)}</h1>

      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>

      <button type="button" onClick={() => setOpen(false)}>
        Close
      </button>

      <Collapsible open={open} onOpenChange={({ open }) => setOpen(open)}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum. <a href="#">Some Link</a>
        </p>
      </Collapsible>
    </div>
  )
}
