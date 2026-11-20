<script lang="ts">
  import PresenceNotification from "#lib/components/presence-notification.svelte"
  import "@styles/presence.css"

  const initialItems = [
    { id: "payment", title: "Payment received", meta: "$1,240 from Northwind" },
    { id: "invite", title: "Invite accepted", meta: "Ada joined the design team" },
    { id: "build", title: "Build finished", meta: "main deployed in 2m 14s" },
  ]

  let items = $state(initialItems)
  const dismissed = $derived(initialItems.length - items.length)
</script>

<main>
  <div class="presence-notifications">
    <p class="hint">Dismiss a notification. It leaves the list once its exit animation ends.</p>
    <ul data-testid="notifications">
      {#each items as item (item.id)}
        <PresenceNotification
          title={item.title}
          meta={item.meta}
          onRemove={() => (items = items.filter((other) => other.id !== item.id))}
        />
      {/each}
    </ul>
    <p class="hint" data-testid="dismissed-count">{dismissed} dismissed</p>
  </div>
</main>
