"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

const backupCodes = ["7F3K-92QD", "M4XP-6TBR", "Q8WN-1JZC", "H2VL-5RYE"]

export default function Page() {
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)

  // Once verified, 2FA is on: the earlier steps can no longer be revisited
  const items: steps.StepItem[] = [
    { value: "password", title: "Confirm password", invalid: !password, editable: !verified },
    { value: "scan", title: "Scan QR code", editable: !verified },
    { value: "verify", title: "Enter code", invalid: !/^\d{6}$/.test(code), editable: !verified },
  ]

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    linear: true,
  })

  const api = steps.connect(service, normalizeProps)

  const verify = async () => {
    setVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setVerifying(false)
    setVerified(true)
    api.goToNextStep()
  }

  const cancel = () => {
    setPassword("")
    setCode("")
    setVerified(false)
    api.resetStep()
  }

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <h2>Enable two-factor authentication</h2>

          <div {...api.getListProps()}>
            {api.items.map((item, index) => (
              <div key={item.value} {...api.getItemProps({ value: item.value })}>
                <button {...api.getTriggerProps({ value: item.value })}>
                  <div {...api.getIndicatorProps({ value: item.value })}>{index + 1}</div>
                  <span>{item.title}</span>
                </button>
                <div {...api.getSeparatorProps({ value: item.value })} />
              </div>
            ))}
          </div>

          <div {...api.getContentProps({ value: "password" })} className="steps-form">
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
          </div>

          <div {...api.getContentProps({ value: "scan" })}>
            <p>Scan this code with your authenticator app, or enter the key manually.</p>
            <code>JBSW Y3DP EHPK 3PXP</code>
          </div>

          <div {...api.getContentProps({ value: "verify" })} className="steps-form">
            <label>
              6-digit code
              <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
            </label>
          </div>

          <div {...api.getContentProps({ value: steps.COMPLETE })}>
            <p>Two-factor authentication is on. Save these backup codes:</p>
            <ul>
              {backupCodes.map((backupCode) => (
                <li key={backupCode}>
                  <code>{backupCode}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="steps-actions">
            {api.complete ? (
              <button {...api.getPrevTriggerProps()}>Back</button>
            ) : (
              <>
                <button onClick={cancel}>Cancel</button>
                <button {...api.getPrevTriggerProps()}>Back</button>
                {api.value === "verify" ? (
                  <button onClick={verify} disabled={verifying || api.item?.invalid}>
                    {verifying ? "Verifying…" : "Verify"}
                  </button>
                ) : (
                  <button {...api.getNextTriggerProps()}>Continue</button>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
