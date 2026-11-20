<script setup lang="ts">
import "@styles/presence.css"

const initialItems = [
  { id: "payment", title: "Payment received", meta: "$1,240 from Northwind" },
  { id: "invite", title: "Invite accepted", meta: "Ada joined the design team" },
  { id: "build", title: "Build finished", meta: "main deployed in 2m 14s" },
]

const items = ref(initialItems)
const dismissed = computed(() => initialItems.length - items.value.length)

function remove(id: string) {
  items.value = items.value.filter((item) => item.id !== id)
}
</script>

<template>
  <main>
    <div class="presence-notifications">
      <p class="hint">Dismiss a notification. It leaves the list once its exit animation ends.</p>
      <ul data-testid="notifications">
        <PresenceNotification
          v-for="item in items"
          :key="item.id"
          :title="item.title"
          :meta="item.meta"
          @remove="remove(item.id)"
        />
      </ul>
      <p class="hint" data-testid="dismissed-count">{{ dismissed }} dismissed</p>
    </div>
  </main>
</template>
