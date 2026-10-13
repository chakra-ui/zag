import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import "@styles/qr-code.css"

type Security = "WPA" | "WEP" | "nopass"

// Characters with special meaning in the Wi-Fi payload must be escaped
const escape = (text: string) => text.replace(/([\\;,:"])/g, "\\$1")

function toWifiPayload(ssid: string, password: string, security: Security) {
  const pass = security === "nopass" ? "" : `P:${escape(password)};`
  return `WIFI:T:${security};S:${escape(ssid)};${pass};`
}

export default function Page() {
  const [ssid, setSsid] = createSignal("Zag Guest")
  const [password, setPassword] = createSignal("state-machines")
  const [security, setSecurity] = createSignal<Security>("WPA")
  const ids = { ssid: createUniqueId(), password: createUniqueId(), security: createUniqueId() }

  const id = createUniqueId()
  const service = useMachine(qrCode.machine, () => ({
    id,
    value: toWifiPayload(ssid(), password(), security()),
  }))

  const api = createMemo(() => qrCode.connect(service, normalizeProps))

  return (
    <main class="qr-code">
      <div class="hstack gap-8 items-start">
        <div class="vstack gap-3">
          <div class="vstack gap-2">
            <label for={ids.ssid}>Network name</label>
            <input id={ids.ssid} value={ssid()} onInput={(e) => setSsid(e.currentTarget.value)} />
          </div>
          <div class="vstack gap-2">
            <label for={ids.security}>Security</label>
            <select
              id={ids.security}
              value={security()}
              onChange={(e) => setSecurity(e.currentTarget.value as Security)}
            >
              <option value="WPA">WPA / WPA2</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </div>
          <Show when={security() !== "nopass"}>
            <div class="vstack gap-2">
              <label for={ids.password}>Password</label>
              <input id={ids.password} value={password()} onInput={(e) => setPassword(e.currentTarget.value)} />
            </div>
          </Show>
        </div>

        <div class="vstack">
          <div {...api().getRootProps()}>
            <svg {...api().getFrameProps()}>
              <path {...api().getPatternProps()} />
            </svg>
          </div>
          <span class="qr-caption">Scan to join {ssid() || "the network"}</span>
        </div>
      </div>
    </main>
  )
}
