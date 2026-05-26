<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine, useSyncExternalStore } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { computed } from "vue"

import styles from "../../../../shared/styles/drawer-indent-effect.module.css"

const stack = drawer.createStack()
const snapshot = useSyncExternalStore(stack.subscribe, stack.getSnapshot)

const service = useMachine(drawer.machine, {
  id: useId(),
  stack,
  modal: false,
})

const api = computed(() => drawer.connect(service, normalizeProps))
const stackApi = computed(() => drawer.connectStack(snapshot.value, normalizeProps))
</script>

<template>
  <main :class="styles.page">
    <div :class="styles.sandbox">
      <div
        v-bind="stackApi.getIndentBackgroundProps()"
        :class="styles.indentBackground"
        data-testid="drawer-indent-background"
      />

      <div v-bind="stackApi.getIndentProps()" :class="styles.indent" data-testid="drawer-indent">
        <div :class="styles.center">
          <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open drawer</button>
        </div>
      </div>

      <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
      <div v-bind="api.getPositionerProps()" :class="styles.positioner">
        <Presence v-bind="api.getContentProps()" :class="styles.content">
          <div v-bind="api.getGrabberProps()" :class="styles.grabber">
            <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
          </div>
          <div :class="styles.contentInner">
            <h2 v-bind="api.getTitleProps()" :class="styles.title">Notifications</h2>
            <p v-bind="api.getDescriptionProps()" :class="styles.description">
              You are all caught up. Good job!
            </p>
            <div :class="styles.actions">
              <button v-bind="api.getCloseTriggerProps()" :class="styles.close">Close</button>
            </div>
          </div>
        </Presence>
      </div>
    </div>
  </main>
</template>
