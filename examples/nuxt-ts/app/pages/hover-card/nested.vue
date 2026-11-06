<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"
import "@styles/menu.css"

const parentService = useMachine(hoverCard.machine, { id: useId() })
const childService = useMachine(hoverCard.machine, { id: useId(), positioning: { placement: "right" } })
const menuService = useMachine(menu.machine, { id: useId() })

const parent = computed(() => hoverCard.connect(parentService, normalizeProps))
const child = computed(() => hoverCard.connect(childService, normalizeProps))
const actions = computed(() => menu.connect(menuService, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <a href="#" data-testid="parent-trigger" v-bind="parent.getTriggerProps()">Zag.js</a>

    <Teleport v-if="parent.open" to="#teleports">
      <div v-bind="parent.getPositionerProps()">
        <div data-testid="parent-content" v-bind="parent.getContentProps()">
          <p>UI components powered by state machines.</p>
          <div style="display: flex; gap: 16px; align-items: center">
            <a href="#" data-testid="child-trigger" v-bind="child.getTriggerProps()">@segunadebayo</a>
            <button data-testid="menu-trigger" v-bind="actions.getTriggerProps()">Actions</button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport v-if="child.open" to="#teleports">
      <div v-bind="child.getPositionerProps()">
        <div data-testid="child-content" v-bind="child.getContentProps()">Segun Adebayo, creator of Zag.js</div>
      </div>
    </Teleport>

    <Teleport v-if="actions.open" to="#teleports">
      <div v-bind="actions.getPositionerProps()">
        <ul data-testid="menu-content" v-bind="actions.getContentProps()">
          <li v-bind="actions.getItemProps({ value: 'follow' })">Follow</li>
          <li v-bind="actions.getItemProps({ value: 'share' })">Share</li>
        </ul>
      </div>
    </Teleport>
  </main>
</template>
