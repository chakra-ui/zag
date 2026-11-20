"use client"

import { autoResizeInput } from "@zag-js/auto-resize"
import { useEffect, useRef } from "react"
import "@styles/autoresize.css"

export default function Page() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => autoResizeInput(inputRef.current), [])

  return (
    <main>
      <div className="autoresize-input-width">
        <label>
          <span>Board name</span>
          <input ref={inputRef} defaultValue="Roadmap" spellCheck={false} />
        </label>
      </div>
    </main>
  )
}
