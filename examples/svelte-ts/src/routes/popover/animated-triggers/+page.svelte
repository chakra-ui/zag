<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/popover-viewport.css"

  const items = [
    { value: "notifications", title: "Notifications", description: "You are all caught up. Good job!" },
    { value: "activity", title: "Activity", description: "Nothing interesting happened recently." },
    {
      value: "profile",
      title: "Jason Eventon",
      description: "Pro plan. Manage your profile settings, billing and team.",
    },
  ]

  const getItem = (value: string) => items.find((item) => item.value === value)!

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    positioning: { placement: "bottom" },
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover animated-triggers">
  <div class="animated-triggers__list">
    <button {...api.getTriggerProps({ value: "notifications" })}>Notifications</button>
    <button {...api.getTriggerProps({ value: "activity" })}>Activity</button>
    <button {...api.getTriggerProps({ value: "profile" })}>Profile</button>
  </div>

  <Portal>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </Presence>
      <Presence {...api.getViewportProps()}>
        {#each api.getContentValues() as value (value)}
          <Presence {...api.getContentProps({ value })}>
            <div {...api.getTitleProps({ value })}>{getItem(value).title}</div>
            <p {...api.getDescriptionProps({ value })}>{getItem(value).description}</p>
          </Presence>
        {/each}
      </Presence>
    </div>
  </Portal>
</main>
