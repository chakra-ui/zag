<script lang="ts">
  import * as qrCode from "@zag-js/qr-code"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    ecc: "L" | "M" | "Q" | "H"
    recovery: string
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(qrCode.machine, () => ({
    id,
    value: "https://zagjs.com",
    encoding: { ecc: props.ecc },
  }))

  const api = $derived(qrCode.connect(service, normalizeProps))
</script>

<div class="qr-tile">
  <div {...mergeProps(api.getRootProps(), { style: { "--qr-size": "120px" } })}>
    <svg {...api.getFrameProps()}>
      <path {...api.getPatternProps()} />
    </svg>
  </div>
  <strong>Level {props.ecc}</strong>
  <span>{props.recovery}</span>
</div>
