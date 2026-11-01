<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as avatar from "@zag-js/avatar"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import { avatarData } from "@zag-js/shared"
  import "@styles/avatar.css"
  import "@styles/tooltip.css"

  const triggerStyle = "border: none; background: none; padding: 0; border-radius: 9999px; cursor: pointer"

  const id = $props.id()
  const avatarService = useMachine(avatar.machine, { id: `${id}-avatar` })
  const avatarApi = $derived(avatar.connect(avatarService, normalizeProps))

  const tooltipService = useMachine(tooltip.machine, { id: `${id}-tooltip` })
  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
</script>

<main class="avatar">
  <!-- The button is both the tooltip trigger and the avatar root -->
  <button
    {...mergeProps(tooltipApi.getTriggerProps(), avatarApi.getRootProps(), { style: triggerStyle })}
    data-size="sm"
  >
    <span {...avatarApi.getFallbackProps()}>PA</span>
    <img alt="" referrerpolicy="no-referrer" src={avatarData.full[0]} {...avatarApi.getImageProps()} />
  </button>

  <Portal>
    <div {...tooltipApi.getPositionerProps()}>
      <Presence class="tooltip-content" {...tooltipApi.getContentProps()}>Naruto Uzumaki</Presence>
    </div>
  </Portal>
</main>
