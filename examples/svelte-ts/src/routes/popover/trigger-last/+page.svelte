<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    modal: false,
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="button-before">Button :before</button>

    <button data-testid="popover-trigger" {...api.getTriggerProps()}>Click me</button>

    <Portal>
      <div {...api.getPositionerProps()}>
        <Presence data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
          <!-- svelte-ignore a11y_invalid_attribute -->
          <a href="#" data-testid="focusable-link">Focusable Link</a>
          <input data-testid="input" placeholder="input" />
          <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </Presence>
      </div>
    </Portal>
  </div>
</main>
