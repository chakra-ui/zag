<script setup lang="ts">
import * as avatar from "@zag-js/avatar"
import * as menu from "@zag-js/menu"
import { avatarData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/avatar.css"
import "@styles/menu.css"

const triggerStyle = {
  border: "none",
  background: "none",
  padding: 0,
  borderRadius: "9999px",
  cursor: "pointer",
}

const avatarService = useMachine(avatar.machine, { id: useId() })
const avatarApi = computed(() => avatar.connect(avatarService, normalizeProps))

const menuService = useMachine(menu.machine, { id: useId(), onSelect: console.log })
const menuApi = computed(() => menu.connect(menuService, normalizeProps))
</script>

<template>
  <main class="avatar">
    <!-- The button is both the menu trigger and the avatar root -->
    <button
      v-bind="mergeProps(menuApi.getTriggerProps(), avatarApi.getRootProps())"
      data-size="sm"
      :style="triggerStyle"
    >
      <span v-bind="avatarApi.getFallbackProps()">PA</span>
      <img alt="" referrerPolicy="no-referrer" :src="avatarData.full[0]" v-bind="avatarApi.getImageProps()" />
    </button>

    <Teleport to="#teleports">
      <div v-if="menuApi.open" v-bind="menuApi.getPositionerProps()">
        <ul v-bind="menuApi.getContentProps()">
          <li v-bind="menuApi.getItemProps({ value: 'profile' })">Profile</li>
          <li v-bind="menuApi.getItemProps({ value: 'settings' })">Settings</li>
          <li v-bind="menuApi.getItemProps({ value: 'signout' })">Sign out</li>
        </ul>
      </div>
    </Teleport>
  </main>
</template>
