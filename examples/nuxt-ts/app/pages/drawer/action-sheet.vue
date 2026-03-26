<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "../../../../shared/styles/drawer-action-sheet.module.css"

const service = useMachine(drawer.machine, { id: useId() })

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Manage Profile</button>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps({ draggable: false })" :class="styles.popup">
        <div :class="styles.surface">
          <div v-bind="api.getTitleProps()" :class="styles.title">Profile Actions</div>
          <ul :class="styles.actions">
            <li :class="styles.action">
              <button type="button" :class="styles.actionButton" @click="api.setOpen(false)">Edit Profile</button>
            </li>
            <li :class="styles.action">
              <button type="button" :class="styles.actionButton" @click="api.setOpen(false)">Change Avatar</button>
            </li>
            <li :class="styles.action">
              <button type="button" :class="styles.actionButton" @click="api.setOpen(false)">Privacy Settings</button>
            </li>
          </ul>
        </div>

        <div :class="styles.dangerSurface">
          <button type="button" :class="styles.dangerButton" @click="api.setOpen(false)">Delete Account</button>
        </div>

        <div :class="styles.surface">
          <button type="button" v-bind="api.getCloseTriggerProps()" :class="styles.actionButton">Cancel</button>
        </div>
      </Presence>
    </div>
  </main>
</template>
