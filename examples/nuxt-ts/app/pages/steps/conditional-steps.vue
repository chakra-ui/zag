<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

type Usage = "solo" | "team"

const name = ref("")
const usage = ref<Usage>("team")

const items = computed<steps.StepItem[]>(() => [
  { value: "profile", title: "Profile", invalid: !name.value.trim() },
  { value: "usage", title: "Usage" },
  // Only teams invite people, so solo users never see this step
  { value: "invite", title: "Invite team", optional: true, disabled: usage.value === "solo" },
  { value: "calendar", title: "Connect calendar", optional: true },
])

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))

const indicator = (value: string, index: number) => {
  const itemState = api.value.getItemState({ value })
  return itemState.completed ? "✓" : itemState.skipped ? "–" : index + 1
}
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <p>{{ api.complete ? "All set" : `Step ${api.index + 1} of ${api.count}` }}</p>
      <div v-bind="api.getProgressProps()">
        <div class="steps-progress-fill" />
      </div>

      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in api.items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">{{ indicator(item.value, index) }}</div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-bind="api.getContentProps({ value: 'profile' })" class="steps-form">
        <label>
          Your name
          <input v-model="name" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'usage' })" class="steps-form">
        <label v-for="option in ['solo', 'team'] as const" :key="option" style="flex-direction: row">
          <input type="radio" name="usage" :checked="usage === option" @change="usage = option" />
          {{ option === "solo" ? "Just me" : "With my team" }}
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'invite' })" class="steps-form">
        <label>
          Teammate emails
          <textarea placeholder="ada@example.com, alan@example.com" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'calendar' })">
        <p>Sync your calendar to see meetings next to your tasks.</p>
        <button>Connect Google Calendar</button>
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
        <p>Welcome aboard, {{ name }}!</p>
        <button @click="api.resetStep()">Start over</button>
      </div>

      <div v-if="!api.complete" class="steps-actions">
        <button v-bind="api.getPrevTriggerProps()">Back</button>
        <button v-bind="api.getSkipTriggerProps()">Do it later</button>
        <button v-bind="api.getNextTriggerProps()">{{ api.canComplete ? "Finish" : "Continue" }}</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
