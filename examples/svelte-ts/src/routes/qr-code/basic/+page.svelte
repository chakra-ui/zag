<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as qrCode from "@zag-js/qr-code"
  import { qrCodeControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/qr-code.css"

  const controls = useControls(qrCodeControls)

  const id = $props.id()
  const service = useMachine(
    qrCode.machine,
    controls.mergeProps<qrCode.Props>({
      id,
      encoding: { ecc: "H" },
    }),
  )

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<main class="qr-code">
  <div class="vstack">
    <div {...api.getRootProps()}>
      <svg {...api.getFrameProps()}>
        <path {...api.getPatternProps()} />
      </svg>
    </div>
    <span class="qr-caption">{api.value}</span>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["encoded"]} />
</Toolbar>
