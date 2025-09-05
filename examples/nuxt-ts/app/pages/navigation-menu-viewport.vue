<script setup lang="ts">
import * as navigationMenu from "@zag-js/navigation-menu"
import { navigationMenuControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDown } from "lucide-vue-next"

const controls = useControls(navigationMenuControls)

const service = useMachine(navigationMenu.machine, {
  id: useId(),
})

const api = computed(() => navigationMenu.connect(service, normalizeProps))
</script>

<template>
  <main class="navigation-menu viewport">
    <div
      :style="{
        position: 'relative',
        display: 'flex',
        boxSizing: 'border-box',
        alignItems: 'center',
        padding: '15px 20px',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 50px 100px -20px rgba(50,50,93,0.1),0 30px 60px -30px rgba(0,0,0,0.2)',
      }"
    >
      <button>Logo</button>
      <div v-bind="api.getRootProps()">
        <div v-bind="api.getIndicatorTrackProps()">
          <div v-bind="api.getListProps()">
            <div v-bind="api.getItemProps({ value: 'products' })">
              <button v-bind="api.getTriggerProps({ value: 'products' })">
                Products
                <ChevronDown />
              </button>
              <span v-bind="api.getTriggerProxyProps({ value: 'products' })" />
              <span v-bind="api.getViewportProxyProps({ value: 'products' })" />
            </div>

            <div v-bind="api.getItemProps({ value: 'company' })">
              <button v-bind="api.getTriggerProps({ value: 'company' })">
                Company
                <ChevronDown />
              </button>
              <span v-bind="api.getTriggerProxyProps({ value: 'company' })" />
              <span v-bind="api.getViewportProxyProps({ value: 'company' })" />
            </div>

            <div v-bind="api.getItemProps({ value: 'developers' })">
              <button v-bind="api.getTriggerProps({ value: 'developers' })">
                Developers
                <ChevronDown />
              </button>
              <span v-bind="api.getTriggerProxyProps({ value: 'developers' })" />
              <span v-bind="api.getViewportProxyProps({ value: 'developers' })" />
            </div>

            <div v-bind="api.getItemProps({ value: 'pricing' })">
              <a href="#" v-bind="api.getLinkProps({ value: 'pricing' })"> Pricing </a>
            </div>

            <Presence v-bind="api.getIndicatorProps()">
              <div v-bind="api.getArrowProps()" />
            </Presence>
          </div>
        </div>

        <div v-bind="api.getViewportPositionerProps()">
          <Presence v-bind="api.getViewportProps()">
            <Presence
              v-bind="api.getContentProps({ value: 'products' })"
              :style="{
                gridTemplateColumns: '1fr 2fr',
                width: '600px',
              }"
            >
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

              <a
                v-for="(item, index) in [
                  'Case Studies',
                  'Success Stories',
                  'Integration Partners',
                  'Security & Compliance',
                ]"
                :key="`products-2-${item}-${index}`"
                href="#"
                v-bind="api.getLinkProps({ value: 'products' })"
              >
                {{ item }}
              </a>
            </Presence>

            <Presence
              v-bind="api.getContentProps({ value: 'company' })"
              :style="{
                gridTemplateColumns: '1fr 1fr',
                width: '450px',
              }"
            >
              <a
                v-for="(item, index) in ['About Us', 'Leadership Team', 'Careers', 'Press Releases']"
                :key="`company-${item}-${index}`"
                href="#"
                v-bind="api.getLinkProps({ value: 'company' })"
              >
                {{ item }}
              </a>

              <a
                v-for="(item, index) in ['Investors', 'Partners', 'Corporate Responsibility']"
                :key="`company-2-${item}-${index}`"
                href="#"
                v-bind="api.getLinkProps({ value: 'company' })"
              >
                {{ item }}
              </a>
            </Presence>

            <Presence
              v-bind="api.getContentProps({ value: 'developers' })"
              :style="{
                gridTemplateColumns: '1.6fr 1fr',
                width: '650px',
              }"
            >
              <a
                v-for="(item, index) in [
                  'API Documentation',
                  'SDKs & Libraries',
                  'Developer Guides',
                  'Code Samples',
                  'Webhooks',
                  'GraphQL Explorer',
                ]"
                :key="`developers-${item}-${index}`"
                href="#"
                v-bind="api.getLinkProps({ value: 'developers' })"
              >
                {{ item }}
              </a>

              <a
                v-for="(item, index) in ['Developer Community', 'Changelog', 'Status Page', 'Rate Limits']"
                :key="`developers-2-${item}-${index}`"
                href="#"
                v-bind="api.getLinkProps({ value: 'developers' })"
              >
                {{ item }}
              </a>
            </Presence>
          </Presence>
        </div>
      </div>
      <button>Login</button>
    </div>

    <header>
      <h1>Heading</h1>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
      <div>
        <button>Get Started</button>
        <a href="#">Learn More</a>
      </div>
    </header>
  </main>

  <Toolbar :viz="true">
    <StateVisualizer :state="service" :context="['value', 'previousValue', 'triggerRect', 'viewportSize']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
