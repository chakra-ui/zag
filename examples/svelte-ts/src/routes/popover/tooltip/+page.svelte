<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as popover from "@zag-js/popover"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import { XIcon } from "lucide-svelte"
  import "@styles/popover.css"
  import "@styles/tooltip.css"

  const id = $props.id()
  const ids = { trigger: `${id}-trigger` }

  const popoverService = useMachine(popover.machine, {
    id: `${id}-popover`,
    ids,
  })

  const tooltipService = useMachine(tooltip.machine, {
    id: `${id}-tooltip`,
    ids,
    positioning: { placement: "top" },
  })

  const popoverApi = $derived(popover.connect(popoverService, normalizeProps))
  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button {...mergeProps(popoverApi.getTriggerProps(), tooltipApi.getTriggerProps())}>Click me</button>

    {#if tooltipApi.open}
      <div {...tooltipApi.getPositionerProps()}>
        <div class="tooltip-content" {...tooltipApi.getContentProps()}>Tooltip</div>
      </div>
    {/if}

    <Portal>
      <div {...popoverApi.getPositionerProps()}>
        <div {...popoverApi.getContentProps()}>
          <div {...popoverApi.getTitleProps()}>Popover Title</div>
          <div data-part="body" data-testid="popover-body">
            <!-- svelte-ignore a11y_missing_attribute -->
            <a>Non-focusable Link</a>
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a href="#" data-testid="focusable-link">Focusable Link</a>
            <input placeholder="input" />
            <button {...popoverApi.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
