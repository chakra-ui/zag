<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    container?: HTMLElement
  }

  const { container }: Props = $props()

  const id = $props.id()
  const service = useMachine(hoverCard.machine, { id })
  const api = $derived(hoverCard.connect(service, normalizeProps))
</script>

<a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api.getTriggerProps()}>Twitter</a>
{#if api.open}
  <Portal {container}>
    <div {...api.getPositionerProps()}>
      <div {...mergeProps(api.getContentProps(), { style: { width: "200px", height: "200px" } })}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        Twitter Preview
        <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">Twitter</a>
      </div>
    </div>
  </Portal>
{/if}
