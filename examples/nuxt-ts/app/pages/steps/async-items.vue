<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const remoteItems: steps.StepItem[] = [
  { value: "profile", title: "Profile" },
  { value: "team", title: "Team" },
  { value: "billing", title: "Billing", optional: true },
  { value: "done", title: "Done" },
]

const items = ref<steps.StepItem[]>([])

let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  timer = setTimeout(() => (items.value = remoteItems), 1500)
})
onBeforeUnmount(() => clearTimeout(timer))

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))

const disableAll = () => {
  items.value = remoteItems.map((item) => ({ ...item, disabled: true }))
}
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <p v-if="items.length === 0">Loading steps…</p>

      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">{{ index + 1 }}</div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-for="item in items" :key="item.value" v-bind="api.getContentProps({ value: item.value })">
        {{ item.title }} content
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">All set 🎉</div>

      <div style="display: flex; gap: 0.5rem; margin-top: 1rem">
        <button v-bind="api.getPreviousTriggerProps()">Back</button>
        <button v-bind="api.getNextTriggerProps()">Next</button>
        <button @click="items = []">Clear items</button>
        <button @click="disableAll">Disable all</button>
        <button @click="items = remoteItems">Restore items</button>
      </div>

      <p style="margin-top: 1rem">
        While no item is navigable the value is <code>{{ String(api.value) }}</code> and navigation is inert. Clearing
        the items mid-flow moves the value to the nearest surviving step instead of throwing.
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
