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
          <button data-peer @click="notifications = !notifications">Notifications</button>
          <DismissableGroupPanel label="Notifications" :open="notifications" @dismiss="notifications = false">
            <p>2 new comments on your pull request.</p>
            <button @click="details = true">View details</button>
          </DismissableGroupPanel>
        </div>
        <div class="column">
          <DismissableGroupPanel label="Details" :open="details" @dismiss="details = false">
            <p>Ama commented on Fix select positioning.</p>
          </DismissableGroupPanel>
        </div>
      </div>
      <p>Open Notifications, choose View details, then close Notifications to see Details stay open.</p>
    </div>
  </main>
</template>
