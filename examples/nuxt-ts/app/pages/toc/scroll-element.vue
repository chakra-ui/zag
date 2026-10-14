<script setup lang="ts">
import { tocControls, tocData } from "@zag-js/shared"
import * as toc from "@zag-js/toc"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toc.css"

const controls = useControls(tocControls)
const scrollRef = ref<HTMLDivElement | null>(null)

const service = useMachine(
  toc.machine,
  controls.mergeProps<toc.Props>({
    id: useId(),
    items: tocData,
    scrollEl: () => scrollRef.value,
  }),
)

const api = computed(() => toc.connect(service, normalizeProps))
</script>

<template>
  <main class="toc">
    <div v-bind="api.getRootProps()">
      <nav v-bind="api.getNavProps()">
        <h5 v-bind="api.getTitleProps()">On this page</h5>
        <ul v-bind="api.getListProps()">
          <div v-bind="api.getIndicatorProps()" />
          <li v-for="item in tocData" :key="item.value" v-bind="api.getItemProps({ item })">
            <a :href="`#${item.value}`" v-bind="api.getLinkProps({ item })">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>

      <section style="flex: 1; min-width: 0">
        <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem">
          <button type="button" @click="api.scrollTo('installation', { behavior: 'instant' })">Installation</button>
          <button type="button" @click="api.scrollTo('api-reference', { behavior: 'smooth' })">API Reference</button>
        </div>

        <div
          ref="scrollRef"
          style="
            border: 1px solid hsl(219, 1%, 72%);
            border-radius: 4px;
            flex: 1;
            max-height: 20rem;
            overflow: auto;
            padding: 1rem;
            scroll-padding-block-start: 1rem;
          "
        >
          <div v-for="item in tocData" :key="item.value" style="margin-bottom: 1rem">
            <h2
              :id="item.value"
              :style="{ fontSize: item.depth === 2 ? '1.25rem' : '1rem', scrollMarginBlockStart: '0.5rem' }"
            >
              {{ item.label }}
            </h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident.
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
