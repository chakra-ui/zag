<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { useMachine, normalizeProps } from "@zag-js/svelte"
  import { qrCodeControls } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"

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
  <StateVisualizer state={service} omit={["encoded"]} />
</Toolbar>
