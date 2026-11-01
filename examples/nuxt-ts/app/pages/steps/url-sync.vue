<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

// Keep the URL readable instead of exposing `steps.COMPLETE`
const toSlug = (value: string | null) => (value === steps.COMPLETE ? "confirmation" : (value ?? "contact"))
const fromSlug = (slug: string | null) => (slug === "confirmation" ? steps.COMPLETE : (slug ?? "contact"))

const route = useRoute()
const router = useRouter()

const email = ref("")
const address = ref("")
const digitalOnly = ref(false)

const items = computed<steps.StepItem[]>(() => [
  { value: "contact", title: "Contact", invalid: !email.value.includes("@") },
  // Digital goods need no shipping
  { value: "shipping", title: "Shipping", invalid: !address.value.trim(), disabled: digitalOnly.value },
  { value: "payment", title: "Payment" },
])

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
    linear: true,
    // The URL is the source of truth, so browser Back/Forward moves between steps
    value: fromSlug(typeof route.query.step === "string" ? route.query.step : null),
    onValueChange({ value }: steps.ValueChangeDetails) {
      router.push({ query: { ...route.query, step: toSlug(value) } })
    },
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in api.items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">{{ index + 1 }}</div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-bind="api.getContentProps({ value: 'contact' })" class="steps-form">
        <label>
          Email
          <input v-model="email" type="email" />
        </label>
        <label style="flex-direction: row">
          <input v-model="digitalOnly" type="checkbox" />
          My cart only has digital items
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'shipping' })" class="steps-form">
        <label>
          Address
          <input v-model="address" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'payment' })">
        <p>Card ending in 4242</p>
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
        <p>Order placed. A receipt is on its way to {{ email }}.</p>
      </div>

      <div v-if="!api.complete" class="steps-actions">
        <button v-bind="api.getPreviousTriggerProps()">Back</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.canComplete ? "Place order" : "Continue" }}</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
