<script setup lang="ts">
import * as navMenu from "@zag-js/nav-menu"
import { navMenuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(navMenu.machine({ id: "1" }))

const api = computed(() => navMenu.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="nav-menu">
    <nav v-bind="api.rootProps">
      <ul v-bind="api.listProps">
        <template v-for="item in navMenuData" :key="item.id">
          <li v-if="item.trigger" v-bind="api.itemProps">
            <button :data-testid="`${item.id}:trigger`" v-bind="api.getTriggerProps({ id: item.id })">
              {{ item.label }} <span v-bind="api.indicatorProps">▾</span>
            </button>
            <div :data-testid="`${item.id}:content`">
              <ul v-bind="api.linkContentGroupProps">
                <li v-for="{ label, id, href } in item.links" :key="id">
                  <a :data-testid="`${id}:link`" :href="href" v-bind="api.getLinkProps({ id })">{{ label }}</a>
                </li>
              </ul>
            </div>
          </li>
          <li v-else v-bind="api.itemProps">
            <a :data-testid="`${item.id}:link`" :href="item.href" v-bind="api.getLinkProps({ id: item.id })">
              {{ item.label }}
            </a>
          </li>
        </template>
      </ul>
    </nav>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
