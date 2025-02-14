<!-- <script lang="ts">
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toast from "@zag-js/toast"
  import { XIcon } from "lucide-svelte"

  interface Props {
    actor: toast.Service
  }

  const { actor }: Props = $props()

  const service = useMachine(actor)
  const api = $derived(toast.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...api.getGhostBeforeProps()}></div>
  <div data-scope="toast" data-part="progressbar"></div>
  <p {...api.getTitleProps()}>{api.title}</p>
  <p {...api.getDescriptionProps()}>{api.description}</p>
  <button {...api.getCloseTriggerProps()}>
    <XIcon />
  </button>
  <div {...api.getGhostAfterProps()}></div>
</div> -->
