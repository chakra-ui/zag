<script lang="ts">
  import * as presence from "@zag-js/presence"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    title: string
    meta: string
    onRemove: () => void
  }

  const { title, meta, onRemove }: Props = $props()

  let present = $state(true)

  const service = useMachine(presence.machine, () => ({ present, onExitComplete: () => onRemove() }))
  const api = $derived(presence.connect(service, normalizeProps))

  function setNode(node: HTMLLIElement) {
    api.setNode(node)
  }
</script>

{#if api.present}
  <li {@attach setNode} data-state={api.skip ? undefined : present ? "open" : "closed"}>
    <span>
      <strong>{title}</strong>
      <br />
      <span class="meta">{meta}</span>
    </span>
    <button type="button" onclick={() => (present = false)}>Dismiss</button>
  </li>
{/if}
