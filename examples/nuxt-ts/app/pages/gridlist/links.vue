<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"

interface Resource {
  id: string
  name: string
  description: string
  href: string
}

const resources: Resource[] = [
  { id: "docs", name: "Documentation", description: "Guides and API reference", href: "https://zagjs.com" },
  { id: "github", name: "GitHub", description: "Source code and issues", href: "https://github.com/chakra-ui/zag" },
  { id: "discord", name: "Discord", description: "Community chat", href: "https://chakra-ui.com/discord" },
  { id: "twitter", name: "Twitter", description: "Updates and announcements", href: "https://twitter.com/zag_js" },
]

const lastNav = ref<string | null>(null)

const collection = gridlist.collection<Resource>({
  items: resources,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
})

const service = useMachine(gridlist.machine, {
  id: useId(),
  collection,
  selectionMode: "none",
  onNavigate({ value, href, preventDefault }) {
    preventDefault()
    lastNav.value = `${value} → ${href}`
  },
} satisfies gridlist.Props<Resource>)

const api = computed(() => gridlist.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Resources</label>
        <div v-bind="api.getContentProps()">
          <div
            v-for="item in resources"
            :key="item.id"
            v-bind="api.getItemProps({ item, href: item.href, target: '_blank', rel: 'noreferrer', focusOnHover: true })"
          >
            <div v-bind="api.getCellProps()">
              <div class="gridlist-item-body">
                <span v-bind="api.getItemTextProps({ item })" class="gridlist-item-title">
                  {{ item.name }}
                </span>
                <span class="gridlist-item-description">{{ item.description }}</span>
              </div>
              <span class="gridlist-item-badge">↗</span>
            </div>
          </div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Last navigation intercepted: <strong>{{ lastNav ?? "—" }}</strong>
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue']" />
  </Toolbar>
</template>
