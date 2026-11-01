<script lang="ts">
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import type { Snippet } from "svelte"
  import Portal from "./portal.svelte"

  interface Props {
    id: string
    nested?: boolean
    children?: Snippet
  }

  const { id, nested, children }: Props = $props()

  const service = useMachine(popover.machine, () => ({ id, modal: false }))
  const api = $derived(popover.connect(service, normalizeProps))
</script>

<div data-part="root">
  {#if !nested}
    <button data-testid="button-before">Button :before</button>
  {/if}

  <button data-testid="popover-trigger" {...api.getTriggerProps()}>
    {nested ? "Open Nested" : "Click me"}
  </button>

  {#if !nested}
    <div {...api.getAnchorProps()}>anchor</div>
  {/if}

  <Portal>
    <div {...api.getPositionerProps()}>
      <div data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title" {...api.getTitleProps()}>Popover Title</div>
        <div data-part="body" data-testid="popover-body">
          <!-- svelte-ignore a11y_missing_attribute -->
          <a>Non-focusable Link</a>
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="#" data-testid="focusable-link">Focusable Link</a>
          <input data-testid="input" placeholder="input" />
          <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
          {@render children?.()}
        </div>
      </div>
    </div>
  </Portal>
  {#if !nested}
    <span data-testid="plain-text">I am just text</span>
    <button data-testid="button-after">Button :after</button>
  {/if}
</div>
