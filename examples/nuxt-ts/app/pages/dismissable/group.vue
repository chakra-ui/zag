<script setup lang="ts">
import "@styles/dismissable.css"

const notifications = ref(false)
const details = ref(false)
</script>

<template>
  <main>
    <div class="group">
      <div class="columns">
        <div class="column">
          <button data-peer data-testid="trigger-a" @click="notifications = !notifications">Notifications</button>
          <DismissableGroupPanel id="a" label="Notifications" :open="notifications" @dismiss="notifications = false">
            <p>2 new comments on your pull request.</p>
            <button data-testid="open-details" @click="details = true">View details</button>
          </DismissableGroupPanel>
        </div>
        <div class="column">
          <DismissableGroupPanel id="b" label="Details" :open="details" @dismiss="details = false">
            <p>Ama commented on Fix select positioning.</p>
          </DismissableGroupPanel>
        </div>
      </div>
      <p data-testid="outside">
        Open Notifications, choose View details, then close Notifications to see Details stay open.
      </p>
    </div>
  </main>
</template>
