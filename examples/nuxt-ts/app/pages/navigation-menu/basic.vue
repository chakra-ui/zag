<script setup lang="ts">
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
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-bind="api.getItemProps({ value: 'products' })">
          <button v-bind="api.getTriggerProps({ value: 'products' })">
            Products
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'products' })">
            <Presence v-bind="api.getIndicatorProps()">
              <div v-bind="api.getArrowProps()" />
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
              v-bind="api.getLinkProps({ value: 'products' })"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'company' })">
          <button v-bind="api.getTriggerProps({ value: 'company' })">
            Company
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'company' })">
            <Presence v-bind="api.getIndicatorProps()">
              <div v-bind="api.getArrowProps()" />
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
              v-bind="api.getLinkProps({ value: 'company' })"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'developers' })">
          <button v-bind="api.getTriggerProps({ value: 'developers' })">
            Developers
            <ChevronDown />
          </button>
          <Presence v-bind="api.getContentProps({ value: 'developers' })">
            <Presence v-bind="api.getIndicatorProps()">
              <div v-bind="api.getArrowProps()" />
            </Presence>
            <a
              v-for="(item, index) in [
                'Investors',
                'Partners',
                'Corporate Responsibility',
              ]"
              :key="`developers-${item}-${index}`"
              href="#"
              v-bind="api.getLinkProps({ value: 'developers' })"
            >
              {{ item }}
            </a>
          </Presence>
        </div>

        <div v-bind="api.getItemProps({ value: 'pricing' })">
          <a href="#" v-bind="api.getLinkProps({ value: 'pricing' })">
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