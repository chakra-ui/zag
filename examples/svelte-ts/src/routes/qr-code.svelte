<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { useMachine, normalizeProps } from "@zag-js/svelte"
  import { qrCodeControls } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(qrCodeControls)

  const [snapshot, send] = useMachine(
    qrCode.machine({
      id: crypto.randomUUID(),
      encoding: { ecc: "H" },
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(qrCode.connect(snapshot, send, normalizeProps))
</script>

<main class="qr-code">
  <div {...api.getRootProps()}>
    <svg {...api.getFrameProps()}>
      <path {...api.getPatternProps()} />
    </svg>
    <div {...api.getOverlayProps()}>
      <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} omit={["encoded"]} />
</Toolbar>
