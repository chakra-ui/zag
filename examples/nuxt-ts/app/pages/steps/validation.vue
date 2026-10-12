<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

interface Project {
  name: string
  region: string
  visibility: "private" | "public"
}

const initialProject: Project = { name: "", region: "", visibility: "private" }

const regions = ["us-east", "eu-west", "ap-south"]

const validate = (project: Project): Record<string, string | undefined> => ({
  details: project.name.trim().length < 3 ? "Name must be at least 3 characters" : undefined,
  region: project.region ? undefined : "Pick a region",
})

const project = ref<Project>({ ...initialProject })
// Errors show once the user tries to leave the step
const touched = ref<string[]>([])
const submitting = ref(false)

const errors = computed(() => validate(project.value))

const items = computed<steps.StepItem[]>(() => [
  { value: "details", title: "Details", invalid: !!errors.value.details },
  { value: "region", title: "Region", invalid: !!errors.value.region },
  { value: "access", title: "Access" },
  { value: "review", title: "Review" },
])

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
    linear: true,
    onNavigationBlocked({ reason, blockedBy }: steps.NavigationBlockedDetails) {
      if (reason === "invalid" && blockedBy) touched.value = [...touched.value, blockedBy]
    },
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))

const update = (patch: Partial<Project>) => {
  project.value = { ...project.value, ...patch }
}

const showError = (value: string) => touched.value.includes(value) && errors.value[value]

const submit = async () => {
  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  submitting.value = false
  api.value.goToNextStep()
}

const reset = () => {
  project.value = { ...initialProject }
  touched.value = []
  api.value.resetStep()
}
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in api.items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">
              {{ showError(item.value) ? "!" : api.getItemState({ value: item.value }).completed ? "✓" : index + 1 }}
            </div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-bind="api.getContentProps({ value: 'details' })" class="steps-form">
        <label>
          Project name
          <input :value="project.name" @input="update({ name: ($event.target as HTMLInputElement).value })" />
        </label>
        <p v-if="showError('details')" class="steps-error">{{ errors.details }}</p>
      </div>

      <div v-bind="api.getContentProps({ value: 'region' })" class="steps-form">
        <label>
          Region
          <select :value="project.region" @change="update({ region: ($event.target as HTMLSelectElement).value })">
            <option value="">Select a region</option>
            <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
          </select>
        </label>
        <p v-if="showError('region')" class="steps-error">{{ errors.region }}</p>
      </div>

      <div v-bind="api.getContentProps({ value: 'access' })" class="steps-form">
        <label v-for="visibility in ['private', 'public'] as const" :key="visibility" style="flex-direction: row">
          <input
            type="radio"
            name="visibility"
            :checked="project.visibility === visibility"
            @change="update({ visibility })"
          />
          {{ visibility }}
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'review' })">
        <dl>
          <dt>Name</dt>
          <dd>{{ project.name }}</dd>
          <dt>Region</dt>
          <dd>{{ project.region }}</dd>
          <dt>Visibility</dt>
          <dd>{{ project.visibility }}</dd>
        </dl>
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
        <p>
          Project <strong>{{ project.name }}</strong> created.
        </p>
        <button @click="reset">Create another</button>
      </div>

      <div v-if="!api.complete" class="steps-actions">
        <button v-bind="api.getPrevTriggerProps()">Back</button>
        <button v-if="api.value === 'review'" :disabled="submitting" @click="submit">
          {{ submitting ? "Creating…" : "Create project" }}
        </button>
        <button v-else v-bind="api.getNextTriggerProps()">Next</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
