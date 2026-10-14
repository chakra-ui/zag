<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import SliderPopoverRange from "$lib/components/slider-popover-range.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/slider.css"
  import "@styles/popover.css"

  const service = useMachine(popover.machine, {
    id: "2",
    modal: true,
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="button-before">Button :before</button>

    <button data-testid="popover-trigger" {...api.getTriggerProps()}>
      Click me
      <div {...api.getIndicatorProps()}>{">"}</div>
    </button>

    <div {...api.getAnchorProps()}>anchor</div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
          <SliderPopoverRange />
        </div>
      </div>
    </Portal>
    <span data-testid="plain-text">I am just text</span>
    <button data-testid="button-after">Button :after</button>
  </div>
</main>
