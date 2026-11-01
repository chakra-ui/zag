"use client"

import { useState } from "react"
import { Checkbox } from "@/components/checkbox"
import "@styles/checkbox.css"

export default function Page() {
  const [checked, setChecked] = useState(false)

  return (
    <main className="checkbox">
      <div className="vstack gap-4">
        <Checkbox
          label="Email me product updates"
          description="State lives in the parent; the checkbox reports changes."
          checked={checked}
          onCheckedChange={(details) => setChecked(details.checked === true)}
          data-testid="hidden-input"
        />

        <div className="hstack">
          <button type="button" onClick={() => setChecked((value) => !value)}>
            Toggle from outside
          </button>
          <span className="checkbox-description">checked: {String(checked)}</span>
        </div>
      </div>
    </main>
  )
}
