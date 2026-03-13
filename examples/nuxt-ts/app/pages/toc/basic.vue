<script setup lang="ts">
import * as toc from "@zag-js/toc"
import { tocControls, tocData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tocControls)

const service = useMachine(
  toc.machine,
  controls.mergeProps<toc.Props>({
    id: useId(),
    items: tocData,
  }),
)

const api = computed(() => toc.connect(service, normalizeProps))
</script>

<template>
  <main class="toc">
    <div style="display: flex; gap: 2rem">
      <nav v-bind="api.getRootProps()">
        <h5 v-bind="api.getTitleProps()">On this page</h5>
        <ul v-bind="api.getListProps()">
          <li
            v-for="item in tocData"
            :key="item.value"
            v-bind="api.getItemProps({ item })"
          >
            <a
              :href="`#${item.value}`"
              v-bind="api.getLinkProps({ item })"
            >
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <div style="max-height: 20rem; overflow: auto; flex: 1">
        <div v-for="item in tocData" :key="item.value" style="margin-bottom: 1rem">
          <h2 :id="item.value" :style="{ fontSize: item.depth === 2 ? '1.25rem' : '1rem' }">
            {{ item.label }}
          </h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
