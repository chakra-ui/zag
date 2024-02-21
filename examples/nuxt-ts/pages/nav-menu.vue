<script setup lang="ts">
import * as navMenu from "@zag-js/nav-menu"
import { navMenuControls, navMenuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(navMenuControls)

const [state, send] = useMachine(navMenu.machine({ id: "1" }))

const api = computed(() => navMenu.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="nav-menu">
    <nav v-bind="api.rootProps">
      <ul :style="{ display: 'flex' }">
        <li v-for="{ menu, menuList } in navMenuData" :key="menu.id">
          <button v-bind="api.getTriggerProps({ id: menu.id })">
            {{ menu.label }} <span v-bind="api.indicatorProps">▾</span>
          </button>
          <div v-bind="api.getPositionerProps({ id: menu.id })">
            <ul v-bind="api.getContentProps({ id: menu.id })">
              <li v-for="item in menuList" :key="JSON.stringify(item)">
                <a :href="item.href" v-bind="api.getMenuItemProps({ id: item.id })">{{ item.label }}</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

<style scoped>
ul {
  list-style: none;
}
</style>
