<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const secondaryRef = ref<HTMLButtonElement | null>(null)
const finalRef = ref<HTMLButtonElement | null>(null)

const service = useMachine(menu.machine, {
  id: useId(),
  initialFocusEl: () => secondaryRef.value,
  finalFocusEl: () => finalRef.value,
})
const contextService = useMachine(menu.machine, {
  id: useId(),
  finalFocusEl: () => finalRef.value,
})
const noFocusService = useMachine(menu.machine, {
  id: useId(),
  initialFocusEl: () => false,
})

const api = computed(() => menu.connect(service, normalizeProps))
const contextApi = computed(() => menu.connect(contextService, normalizeProps))
const noFocusApi = computed(() => menu.connect(noFocusService, normalizeProps))
</script>

<template>
  <main>
    <div style="display: flex; gap: 16px; align-items: center">
      <button data-testid="trigger" v-bind="api.getTriggerProps()">Actions</button>
      <button data-testid="no-focus-trigger" v-bind="noFocusApi.getTriggerProps()">No initial focus</button>
      <button ref="finalRef" data-testid="final-focus">Final focus target</button>
      <button data-testid="outside">Outside</button>
    </div>

    <div data-testid="context-trigger" v-bind="contextApi.getContextTriggerProps()">Right click here</div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button data-testid="primary">Primary</button>
          <button ref="secondaryRef" data-testid="secondary">Secondary</button>
          <div v-bind="api.getListProps()">
            <div v-bind="api.getItemProps({ value: 'edit' })">Edit</div>
            <div v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="contextApi.getPositionerProps()">
        <div data-testid="context-content" v-bind="contextApi.getContentProps()">
          <div v-bind="contextApi.getListProps()">
            <div v-bind="contextApi.getItemProps({ value: 'rename' })">Rename</div>
            <div v-bind="contextApi.getItemProps({ value: 'delete' })">Delete</div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="noFocusApi.getPositionerProps()">
        <div data-testid="no-focus-content" v-bind="noFocusApi.getContentProps()">
          <div v-bind="noFocusApi.getListProps()">
            <div v-bind="noFocusApi.getItemProps({ value: 'a' })">A</div>
            <div v-bind="noFocusApi.getItemProps({ value: 'b' })">B</div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
