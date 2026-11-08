<script lang="ts">
  import Panel from "#lib/components/dismissable-group-panel.svelte"
  import "@styles/dismissable.css"

  let notifications = $state(false)
  let details = $state(false)
</script>

<main>
  <div class="group">
    <div class="columns">
      <div class="column">
        <button data-peer data-testid="trigger-a" onclick={() => (notifications = !notifications)}>Notifications</button
        >
        <Panel id="a" label="Notifications" open={notifications} ondismiss={() => (notifications = false)}>
          <p>2 new comments on your pull request.</p>
          <button data-testid="open-details" onclick={() => (details = true)}>View details</button>
        </Panel>
      </div>
      <div class="column">
        <Panel id="b" label="Details" open={details} ondismiss={() => (details = false)}>
          <p>Ama commented on Fix select positioning.</p>
        </Panel>
      </div>
    </div>
    <p data-testid="outside">
      Open Notifications, choose View details, then close Notifications to see Details stay open.
    </p>
  </div>
</main>
