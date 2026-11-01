<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    modal: true,
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="button-before">Button :before</button>

    <button data-testid="popover-trigger" {...api.getTriggerProps()}>Sort by</button>

    <Portal>
      <div {...api.getPositionerProps()}>
        <Presence data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
          <fieldset style="border: none; padding: 0">
            <label>
              <input data-testid="radio-name-asc" type="radio" name="sort" value="name-asc" checked /> Name (A to Z)
            </label>
            <label>
              <input data-testid="radio-name-desc" type="radio" name="sort" value="name-desc" /> Name (Z to A)
            </label>
            <label>
              <input data-testid="radio-hours" type="radio" name="sort" value="hours" /> Hours
            </label>
          </fieldset>
        </Presence>
      </div>
    </Portal>

    <button data-testid="button-after">Button :after</button>
  </div>
</main>
