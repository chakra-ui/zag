<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import Portal from "./portal.svelte"

  const id = $props.id()

  const service1 = useMachine(popover.machine, { id: `${id}-1`, modal: false })
  const api1 = $derived(popover.connect(service1, normalizeProps))

  const service2 = useMachine(popover.machine, { id: `${id}-2`, modal: false })
  const api2 = $derived(popover.connect(service2, normalizeProps))

  const service3 = useMachine(popover.machine, { id: `${id}-3`, modal: false })
  const api3 = $derived(popover.connect(service3, normalizeProps))
</script>

<div>
  <button data-testid="popover-trigger-1" {...api1.getTriggerProps()}>Open First Popover</button>

  <Portal>
    <div {...api1.getPositionerProps()}>
      <div data-testid="popover-content-1" class="popover-content" {...api1.getContentProps()}>
        <div {...api1.getArrowProps()}>
          <div {...api1.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title-1" {...api1.getTitleProps()}>First Popover</div>
        <div data-part="body" data-testid="popover-body-1">
          <p>This is the first level popover in the dialog.</p>
          <button data-testid="popover-trigger-2" {...api2.getTriggerProps()}>Open Second Popover</button>
          <button data-testid="popover-close-button-1" {...api1.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  </Portal>

  <Portal>
    <div {...api2.getPositionerProps()}>
      <div data-testid="popover-content-2" class="popover-content" {...api2.getContentProps()}>
        <div {...api2.getArrowProps()}>
          <div {...api2.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title-2" {...api2.getTitleProps()}>Second Popover</div>
        <div data-part="body" data-testid="popover-body-2">
          <p>This is the second level popover.</p>
          <input data-testid="input-2" placeholder="Enter text here" />
          <button data-testid="popover-trigger-3" {...api3.getTriggerProps()}>Open Third Popover</button>
          <button data-testid="popover-close-button-2" {...api2.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  </Portal>

  <Portal>
    <div {...api3.getPositionerProps()}>
      <div data-testid="popover-content-3" class="popover-content" {...api3.getContentProps()}>
        <div {...api3.getArrowProps()}>
          <div {...api3.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title-3" {...api3.getTitleProps()}>Third Popover</div>
        <div data-part="body" data-testid="popover-body-3">
          <p>This is the deepest level popover.</p>
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="#" data-testid="focusable-link-3">Focusable Link</a>
          <button data-testid="popover-close-button-3" {...api3.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </div>
  </Portal>
</div>
