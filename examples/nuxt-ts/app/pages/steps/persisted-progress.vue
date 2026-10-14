<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const STORAGE_KEY = "zag:steps-progress"

const items: steps.StepItem[] = [
  { value: "domain", title: "Connect domain", description: "Point your DNS to us" },
  { value: "branding", title: "Branding", description: "Logo and colors" },
  { value: "payouts", title: "Payouts", description: "Where we send money" },
  { value: "review", title: "Review", description: "Check and launch" },
]

interface Progress {
  value: string | null
  completedValues: string[]
}

const load = (): Progress => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (saved) return saved
  } catch {}
  return { value: items[0]!.value, completedValues: [] }
}

// Empty until storage is read, so the server render matches the client
const progress = ref<Progress>({ value: null, completedValues: [] })

onMounted(() => {
  progress.value = load()
})

const save = (patch: Partial<Progress>) => {
  const next = { ...progress.value, ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {}
  progress.value = next
}

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items,
    linear: true,
    orientation: "vertical" as const,
    value: progress.value.value ?? undefined,
    completedValues: progress.value.completedValues,
    onValueChange: ({ value }: steps.ValueChangeDetails) => save({ value }),
    onCompletedChange: ({ completedValues }: steps.CompletedChangeDetails) => save({ completedValues }),
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
            <div v-bind="api.getIndicatorProps({ value: item.value })">
              {{ api.getItemState({ value: item.value }).completed ? "✓" : index + 1 }}
            </div>
            <span>
              {{ item.title }}
              <br />
              <small>{{ item.description }}</small>
            </span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div style="flex: 1">
        <div v-for="item in items" :key="item.value" v-bind="api.getContentProps({ value: item.value })">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}. Your progress is saved, so you can leave and pick up here later.</p>
        </div>

        <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
          <h3>Your store is live</h3>
        </div>

        <div class="steps-actions">
          <button v-bind="api.getPrevTriggerProps()">Back</button>
          <button v-if="!api.complete" v-bind="api.getNextTriggerProps()">
            {{ api.canComplete ? "Launch" : "Next" }}
          </button>
          <button @click="api.resetStep()">Reset progress</button>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
