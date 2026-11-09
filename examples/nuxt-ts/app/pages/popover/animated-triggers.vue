<script lang="ts" setup>
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
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

const service = useMachine(popover.machine, {
  id: useId(),
  positioning: { placement: "bottom" },
})

const api = computed(() => popover.connect(service, normalizeProps))
</script>

<template>
  <main class="popover animated-triggers">
    <div class="animated-triggers__list">
      <button v-bind="api.getTriggerProps({ value: 'notifications' })">Notifications</button>
      <button v-bind="api.getTriggerProps({ value: 'activity' })">Activity</button>
      <button v-bind="api.getTriggerProps({ value: 'profile' })">Profile</button>
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </Presence>
        <Presence v-bind="api.getViewportProps()">
          <Presence v-for="value in api.getContentValues()" :key="value" v-bind="api.getContentProps({ value })">
            <div v-bind="api.getTitleProps({ value })">{{ getItem(value).title }}</div>
            <p v-bind="api.getDescriptionProps({ value })">{{ getItem(value).description }}</p>
          </Presence>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
