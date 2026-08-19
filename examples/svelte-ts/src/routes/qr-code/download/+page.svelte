<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let preview = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(qrCode.machine, {
    id,
    value: "https://zagjs.com",
    encoding: { ecc: "H" },
  })

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<main class="qr-code">
  <div {...api.getRootProps()}>
    <svg {...api.getFrameProps()}>
      <path {...api.getPatternProps()}></path>
    </svg>
    <div {...api.getOverlayProps()}>
      <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
    </div>
  </div>

  <button {...api.getDownloadTriggerProps({ mimeType: "image/png", quality: 1, fileName: "qr-code.png" })}>
    Download
  </button>
  <button onclick={() => api.getDataUrl("image/png", 1).then((data) => (preview = data))}>Preview</button>

  {#if preview}
    <img width="120" height="120" src={preview} alt="qr-code preview" />
  {/if}
</main>
