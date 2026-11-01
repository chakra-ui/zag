<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/qr-code.css"

  let value = $state("https://zagjs.com")

  const id = $props.id()
  const inputId = `${id}-input`

  const service = useMachine(qrCode.machine, () => ({
    id,
    value,
  }))

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<main class="qr-code">
  <div class="vstack gap-4">
    <div class="vstack gap-2">
      <label for={inputId}>Text or URL</label>
      <input id={inputId} bind:value placeholder="Type something…" style="width: 240px" />
    </div>

    <div {...api.getRootProps()}>
      <svg {...api.getFrameProps()}>
        <path {...api.getPatternProps()} />
      </svg>
    </div>

    <span class="qr-caption">{value.length} characters</span>
  </div>
</main>
