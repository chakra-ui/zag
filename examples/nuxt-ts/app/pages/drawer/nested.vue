<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { computed, ref } from "vue"
import styles from "../../../../shared/styles/drawer-nested.module.css"

const baseId = useId()
const firstOpen = ref(false)
const secondOpen = ref(false)
const thirdOpen = ref(false)

const firstService = useMachine(
  drawer.machine,
  computed(() => ({
    id: `${baseId}-root`,
    open: firstOpen.value,
    onOpenChange(details: { open: boolean }) {
      firstOpen.value = details.open
      if (!details.open) {
        secondOpen.value = false
        thirdOpen.value = false
      }
    },
  })),
)

const secondService = useMachine(
  drawer.machine,
  computed(() => ({
    id: `${baseId}-second`,
    open: secondOpen.value,
    onOpenChange(details: { open: boolean }) {
      secondOpen.value = details.open
      if (!details.open) thirdOpen.value = false
    },
  })),
)

const thirdService = useMachine(
  drawer.machine,
  computed(() => ({
    id: `${baseId}-third`,
    open: thirdOpen.value,
    onOpenChange(details: { open: boolean }) {
      thirdOpen.value = details.open
    },
  })),
)

const firstApi = computed(() => drawer.connect(firstService, normalizeProps))
const secondApi = computed(() => drawer.connect(secondService, normalizeProps))
const thirdApi = computed(() => drawer.connect(thirdService, normalizeProps))

const deviceName = ref("Personal laptop")
const notes = ref("Rotate recovery codes and revoke older sessions.")
</script>

<template>
  <main :class="styles.main">
    <button v-bind="firstApi.getTriggerProps()" :class="styles.button">Open drawer stack</button>

    <Presence v-bind="firstApi.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="firstApi.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="firstApi.getContentProps()" :class="styles.contentHost">
        <div :class="styles.popup">
          <div v-bind="firstApi.getGrabberProps()" :class="styles.handle">
            <div v-bind="firstApi.getGrabberIndicatorProps()" />
          </div>
          <div :class="styles.content">
            <div v-bind="firstApi.getTitleProps()" :class="styles.title">Account</div>
            <p :class="styles.description">
              Nested drawers can be styled to stack, while each drawer remains independently focus managed.
            </p>

            <div :class="styles.actions">
              <div :class="styles.actionsLeft">
                <button v-bind="secondApi.getTriggerProps()" :class="styles.ghostButton">Security settings</button>
              </div>
              <button v-bind="firstApi.getCloseTriggerProps()" :class="styles.button">Close</button>
            </div>
          </div>
        </div>
      </Presence>
    </div>

    <Teleport to="body">
      <div v-bind="secondApi.getPositionerProps()" :class="styles.positioner">
        <Presence v-bind="secondApi.getContentProps()" :class="styles.contentHost">
          <div :class="styles.popup">
            <div v-bind="secondApi.getGrabberProps()" :class="styles.handle">
              <div v-bind="secondApi.getGrabberIndicatorProps()" />
            </div>
            <div :class="styles.content">
              <div v-bind="secondApi.getTitleProps()" :class="styles.title">Security</div>
              <p :class="styles.description">Review sign-in activity and update your security preferences.</p>

              <ul :class="styles.list">
                <li>Passkeys enabled</li>
                <li>2FA via authenticator app</li>
                <li>3 signed-in devices</li>
              </ul>

              <div :class="styles.actions">
                <div :class="styles.actionsLeft">
                  <button v-bind="thirdApi.getTriggerProps()" :class="styles.ghostButton">Advanced options</button>
                </div>
                <button v-bind="secondApi.getCloseTriggerProps()" :class="styles.button">Close</button>
              </div>
            </div>
          </div>
        </Presence>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-bind="thirdApi.getPositionerProps()" :class="styles.positioner">
        <Presence v-bind="thirdApi.getContentProps()" :class="styles.contentHost">
          <div :class="styles.popup">
            <div v-bind="thirdApi.getGrabberProps()" :class="styles.handle">
              <div v-bind="thirdApi.getGrabberIndicatorProps()" />
            </div>
            <div :class="styles.content">
              <div v-bind="thirdApi.getTitleProps()" :class="styles.title">Advanced</div>
              <p :class="styles.description">This drawer is taller to demonstrate variable-height stacking.</p>

              <div :class="styles.field">
                <label :class="styles.label" for="device-name">Device name</label>
                <input id="device-name" v-model="deviceName" :class="styles.input" />
              </div>

              <div :class="styles.field">
                <label :class="styles.label" for="notes">Notes</label>
                <textarea id="notes" v-model="notes" :class="styles.textarea" rows="3" />
              </div>

              <div :class="styles.actions">
                <button v-bind="thirdApi.getCloseTriggerProps()" :class="styles.button">Done</button>
              </div>
            </div>
          </div>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
