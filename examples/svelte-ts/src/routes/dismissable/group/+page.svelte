<script lang="ts">
  import Panel from "#lib/components/dismissable-group-panel.svelte"
  import "@styles/dismissable.css"
</script>

<main class="group">
  <div class="row">
    <Panel id="a" label="Notifications">
      <p>2 new comments on your pull request.</p>
    </Panel>
    <Panel id="b" label="Account">
      <p>Signed in as ama@example.com.</p>
    </Panel>
  </div>
  <p data-testid="outside">Open both panels, then press Escape twice. The last one opened closes first.</p>
</main>
