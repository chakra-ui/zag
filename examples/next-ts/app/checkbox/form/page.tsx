"use client"

import { useState } from "react"
import { Checkbox } from "@/components/checkbox"
import "@styles/checkbox.css"

export default function Page() {
  const [accepted, setAccepted] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const invalid = submitted && !accepted

  return (
    <main className="checkbox">
      <form
        className="vstack gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          setSubmitted(true)
          if (!accepted) return setResult(null)
          // The hidden input posts `name=value` like a native checkbox
          setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))))
        }}
      >
        <Checkbox name="newsletter" value="weekly" label="Subscribe to the weekly newsletter" defaultChecked />
        <Checkbox
          name="terms"
          label="I agree to the terms"
          required
          invalid={invalid}
          checked={accepted}
          onCheckedChange={({ checked }) => setAccepted(checked === true)}
        />
        {invalid && <p className="checkbox-error">You need to accept the terms to continue.</p>}

        <div className="hstack">
          <button type="submit" data-variant="solid">
            Submit
          </button>
          {result && <code className="checkbox-description">{result}</code>}
        </div>
      </form>
    </main>
  )
}
