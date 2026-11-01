<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/qr-code.css"

  const id = $props.id()
  const service = useMachine(qrCode.machine, {
    id,
    value: "https://zagjs.com",
    // The logo hides the middle modules; the highest error correction recovers them
    encoding: { ecc: "H" },
  })

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<main class="qr-code">
  <div class="vstack">
    <div {...api.getRootProps()}>
      <svg {...api.getFrameProps()}>
        <path {...api.getPatternProps()} />
      </svg>
      <div {...api.getOverlayProps()}>
        <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
      </div>
    </div>
    <span class="qr-caption">{api.value} · error correction H</span>
  </div>
</main>
