<script setup lang="ts">
import "@styles/dismissable.css"
</script>

<template>
  <main class="group">
    <div class="row">
      <DismissableGroupPanel id="a" label="Notifications">
        <p>2 new comments on your pull request.</p>
      </DismissableGroupPanel>
      <DismissableGroupPanel id="b" label="Account">
        <p>Signed in as ama@example.com.</p>
      </DismissableGroupPanel>
    </div>
    <p data-testid="outside">Open both panels, then press Escape twice. The last one opened closes first.</p>
  </main>
</template>
