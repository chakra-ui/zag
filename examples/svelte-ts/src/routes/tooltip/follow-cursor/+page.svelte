<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip.css"

  const id = "tip-1"

  let anchorRect: DOMRect | null = null

  const service = useMachine(tooltip.machine, {
    id: "1",
    openDelay: 0,
    closeDelay: 0,
    positioning: {
      gutter: 4,
      placement: "top-start",
      getAnchorRect: () => anchorRect,
    },
  })

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button
      data-testid={`${id}-trigger`}
      {...mergeProps(api.getTriggerProps(), {
        style: "width: 200px; height: 40px",
        onpointermove(event: PointerEvent) {
          anchorRect = DOMRect.fromRect({
            x: event.clientX,
            y: event.clientY,
            width: 1,
            height: 1,
          })

          api.reposition()
        },
      })}
    >
      Hover me
    </button>
    <div {...api.getPositionerProps()}>
      <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>Tooltip</div>
    </div>
  </div>
</main>
