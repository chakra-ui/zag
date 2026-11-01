<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/qr-code.css"

  type Security = "WPA" | "WEP" | "nopass"

  // Characters with special meaning in the Wi-Fi payload must be escaped
  const escape = (text: string) => text.replace(/([\;,:"])/g, "\\$1")

  function toWifiPayload(ssid: string, password: string, security: Security) {
    const pass = security === "nopass" ? "" : `P:${escape(password)};`
    return `WIFI:T:${security};S:${escape(ssid)};${pass};`
  }

  let ssid = $state("Zag Guest")
  let password = $state("state-machines")
  let security = $state<Security>("WPA")

  const id = $props.id()
  const ids = { ssid: `${id}-ssid`, password: `${id}-password`, security: `${id}-security` }

  const service = useMachine(qrCode.machine, () => ({
    id,
    value: toWifiPayload(ssid, password, security),
  }))

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<main class="qr-code">
  <div class="hstack gap-8 items-start">
    <div class="vstack gap-3">
      <div class="vstack gap-2">
        <label for={ids.ssid}>Network name</label>
        <input id={ids.ssid} bind:value={ssid} />
      </div>
      <div class="vstack gap-2">
        <label for={ids.security}>Security</label>
        <select id={ids.security} bind:value={security}>
          <option value="WPA">WPA / WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None</option>
        </select>
      </div>
      {#if security !== "nopass"}
        <div class="vstack gap-2">
          <label for={ids.password}>Password</label>
          <input id={ids.password} bind:value={password} />
        </div>
      {/if}
    </div>

    <div class="vstack">
      <div {...api.getRootProps()}>
        <svg {...api.getFrameProps()}>
          <path {...api.getPatternProps()} />
        </svg>
      </div>
      <span class="qr-caption">Scan to join {ssid || "the network"}</span>
    </div>
  </div>
</main>
