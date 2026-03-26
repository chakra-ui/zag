<script setup lang="ts">
import styles from "../../../../../shared/src/css/navigation-menu.module.css"
import * as navigationMenu from "@zag-js/navigation-menu"
import { navigationMenuControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDown } from "lucide-vue-next"

const controls = useControls(navigationMenuControls)

const service = useMachine(
  navigationMenu.machine,
  controls.mergeProps<navigationMenu.Props>({
    id: useId(),
  }),
)

const api = computed(() => navigationMenu.connect(service, normalizeProps))

</script>

<template>
  <main class="navigation-menu basic">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getListProps()" :class="styles.List">
        <div v-bind="api.getItemProps({ value: 'products' })" :class="styles.Item">
          <button v-bind="api.getTriggerProps({ value: 'products' })" :class="styles.Trigger">
            Products
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'products' })" :class="styles.Content">
            <Presence v-bind="api.getIndicatorProps()" :class="styles.Indicator">
              <div v-bind="api.getArrowProps()" :class="styles.Arrow" />
            </Presence>
            <a
              v-for="(item, index) in [
                'Analytics Platform',
                'Customer Engagement',
                'Marketing Automation',
                'Data Integration',
                'Enterprise Solutions',
                'API Documentation',
              ]"
              :key="`products-${item}-${index}`"
              href="#"
              v-bind="api.getLinkProps({ value: 'products' })" :class="styles.Link"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'company' })" :class="styles.Item">
          <button v-bind="api.getTriggerProps({ value: 'company' })" :class="styles.Trigger">
            Company
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'company' })" :class="styles.Content">
            <Presence v-bind="api.getIndicatorProps()" :class="styles.Indicator">
              <div v-bind="api.getArrowProps()" :class="styles.Arrow" />
            </Presence>
            <a
              v-for="(item, index) in [
                'About Us',
                'Leadership Team',
                'Careers',
                'Press Releases',
              ]"
              :key="`company-${item}-${index}`"
              href="#"
              v-bind="api.getLinkProps({ value: 'company' })" :class="styles.Link"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'developers' })" :class="styles.Item">
          <button v-bind="api.getTriggerProps({ value: 'developers' })" :class="styles.Trigger">
            Developers
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'developers' })" :class="styles.Content">
            <Presence v-bind="api.getIndicatorProps()" :class="styles.Indicator">
              <div v-bind="api.getArrowProps()" :class="styles.Arrow" />
            </Presence>
            <a
              v-for="(item, index) in [
                'Investors',
                'Partners',
                'Corporate Responsibility',
              ]"
              :key="`developers-${item}-${index}`"
              href="#"
              v-bind="api.getLinkProps({ value: 'developers' })" :class="styles.Link"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'pricing' })" :class="styles.Item">
          <a href="#" v-bind="api.getLinkProps({ value: 'pricing' })" :class="styles.Link">
            Pricing
          </a>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'previousValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>