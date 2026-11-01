<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"
import "@styles/menu.css"

// Every positioner stays mounted while closed, so its portal is in the DOM before any dialog opens
const service1 = useMachine(dialog.machine, { id: useId() })
const dialog1 = computed(() => dialog.connect(service1, normalizeProps))

const service2 = useMachine(dialog.machine, { id: useId() })
const dialog2 = computed(() => dialog.connect(service2, normalizeProps))

const service3 = useMachine(dialog.machine, { id: useId() })
const dialog3 = computed(() => dialog.connect(service3, normalizeProps))

const menuService = useMachine(menu.machine, { id: useId() })
const actions = computed(() => menu.connect(menuService, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="dialog1.getTriggerProps()" data-testid="trigger-1">Open Dialog 1</button>

    <Teleport to="#teleports">
      <div v-bind="dialog1.getBackdropProps()" />
      <div data-testid="positioner-1" v-bind="dialog1.getPositionerProps()">
        <div data-testid="content-1" v-bind="dialog1.getContentProps()">
          <h2 v-bind="dialog1.getTitleProps()">Dialog 1</h2>
          <button v-bind="dialog2.getTriggerProps()" data-testid="trigger-2">Open Dialog 2</button>
          <button v-bind="actions.getTriggerProps()" data-testid="menu-trigger">Actions</button>
          <button v-bind="dialog1.getCloseTriggerProps()" data-testid="close-1">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="dialog2.getBackdropProps()" />
      <div data-testid="positioner-2" v-bind="dialog2.getPositionerProps()">
        <div data-testid="content-2" v-bind="dialog2.getContentProps()">
          <h2 v-bind="dialog2.getTitleProps()">Dialog 2</h2>
          <button data-testid="open-3" @click="dialog3.setOpen(true)">Open Dialog 3</button>
          <button v-bind="dialog2.getCloseTriggerProps()" data-testid="close-2">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="dialog3.getBackdropProps()" />
      <div data-testid="positioner-3" v-bind="dialog3.getPositionerProps()">
        <div data-testid="content-3" v-bind="dialog3.getContentProps()">
          <h2 v-bind="dialog3.getTitleProps()">Dialog 3</h2>
          <button v-bind="dialog3.getCloseTriggerProps()" data-testid="close-3">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div data-testid="menu-positioner" v-bind="actions.getPositionerProps()">
        <ul data-testid="menu-content" v-bind="actions.getContentProps()">
          <li v-bind="actions.getItemProps({ value: 'rename' })">Rename</li>
          <li v-bind="actions.getItemProps({ value: 'delete' })">Delete</li>
        </ul>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer label="Dialog 1" :state="service1" />
    <StateVisualizer label="Dialog 2" :state="service2" />
    <StateVisualizer label="Dialog 3" :state="service3" />
  </Toolbar>
</template>
