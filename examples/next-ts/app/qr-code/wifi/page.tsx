"use client"

import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/qr-code.css"

type Security = "WPA" | "WEP" | "nopass"

// Characters with special meaning in the Wi-Fi payload must be escaped
const escape = (text: string) => text.replace(/([\\;,:"])/g, "\\$1")

function toWifiPayload(ssid: string, password: string, security: Security) {
  const pass = security === "nopass" ? "" : `P:${escape(password)};`
  return `WIFI:T:${security};S:${escape(ssid)};${pass};`
}

export default function Page() {
  const [ssid, setSsid] = useState("Zag Guest")
  const [password, setPassword] = useState("state-machines")
  const [security, setSecurity] = useState<Security>("WPA")
  const ids = { ssid: useId(), password: useId(), security: useId() }

  const service = useMachine(qrCode.machine, {
    id: useId(),
    value: toWifiPayload(ssid, password, security),
  })

  const api = qrCode.connect(service, normalizeProps)

  return (
    <main className="qr-code">
      <div className="hstack gap-8 items-start">
        <div className="vstack gap-3">
          <div className="vstack gap-2">
            <label htmlFor={ids.ssid}>Network name</label>
            <input id={ids.ssid} value={ssid} onChange={(e) => setSsid(e.target.value)} />
          </div>
          <div className="vstack gap-2">
            <label htmlFor={ids.security}>Security</label>
            <select id={ids.security} value={security} onChange={(e) => setSecurity(e.target.value as Security)}>
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
          {security !== "nopass" && (
            <div className="vstack gap-2">
              <label htmlFor={ids.password}>Password</label>
              <input id={ids.password} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
        </div>

        <div className="vstack">
          <div {...api.getRootProps()}>
            <svg {...api.getFrameProps()}>
              <path {...api.getPatternProps()} />
            </svg>
          </div>
          <span className="qr-caption">Scan to join {ssid || "the network"}</span>
        </div>
      </div>
    </main>
  )
}
