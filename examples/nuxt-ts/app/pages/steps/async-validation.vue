<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const takenUsernames = ["admin", "zag", "chakra"]

// Stands in for a server call
const checkUsername = (username: string) =>
  new Promise<string | undefined>((resolve) => {
    setTimeout(() => resolve(takenUsernames.includes(username.toLowerCase()) ? "Username is taken" : undefined), 800)
  })

const username = ref("")
const displayName = ref("")
const serverError = ref<string>()
const checking = ref(false)
// Bumped on every edit or step change, so a check that resolves late is ignored
let checkId = 0

const items = computed<steps.StepItem[]>(() => [
  { value: "account", title: "Account", invalid: !!serverError.value },
  { value: "profile", title: "Profile", invalid: !displayName.value.trim() },
  { value: "review", title: "Review" },
])

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
    linear: true,
    onValueChange() {
      checkId++
      checking.value = false
    },
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))

const filled = computed(() =>
  api.value.value === "account"
    ? !!username.value.trim()
    : api.value.value === "profile"
      ? !!displayName.value.trim()
      : true,
)

const editUsername = (value: string) => {
  checkId++
  username.value = value
  serverError.value = undefined
  checking.value = false
}

const next = async () => {
  if (api.value.value !== "account") return api.value.goToNextStep()

  const currentId = ++checkId
  checking.value = true
  const error = await checkUsername(username.value.trim())
  if (currentId !== checkId) return

  checking.value = false
  serverError.value = error
  if (!error) api.value.goToNextStep()
}

const reset = () => {
  editUsername("")
  displayName.value = ""
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
              {{
                item.value === "account" && serverError
                  ? "!"
                  : api.getItemState({ value: item.value }).completed
                    ? "✓"
                    : index + 1
              }}
            </div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-bind="api.getContentProps({ value: 'account' })" class="steps-form">
        <label>
          Username
          <input
            :value="username"
            :aria-invalid="!!serverError"
            @input="editUsername(($event.target as HTMLInputElement).value)"
          />
        </label>
        <p>Try "admin" to see the server reject it.</p>
        <p v-if="serverError" class="steps-error">{{ serverError }}</p>
      </div>

      <div v-bind="api.getContentProps({ value: 'profile' })" class="steps-form">
        <label>
          Display name
          <input v-model="displayName" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'review' })">
        <dl>
          <dt>Username</dt>
          <dd>{{ username }}</dd>
          <dt>Display name</dt>
          <dd>{{ displayName }}</dd>
        </dl>
      </div>

      <div v-bind="api.getCompletedContentProps()">
        <p>
          Welcome, <strong>{{ displayName }}</strong
          >.
        </p>
        <button @click="reset">Start over</button>
      </div>

      <div v-if="!api.complete" class="steps-actions">
        <button v-bind="api.getPreviousTriggerProps()">Back</button>
        <button :disabled="checking || !filled" :aria-busy="checking" @click="next">
          {{ checking ? "Checking…" : api.value === "review" ? "Create account" : "Next" }}
        </button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
