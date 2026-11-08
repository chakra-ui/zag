<script setup lang="ts">
import * as field from "@zag-js/field"
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"
import "@styles/fieldset.css"

type Errors = { email?: string; username?: string }

const takenUsernames = ["admin", "lope"]

// stands in for a round trip to the server
function check(email: string, username: string): Errors {
  const errors: Errors = {}
  if (!email) errors.email = "Enter your email address"
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address"
  if (!username) errors.username = "Choose a username"
  else if (takenUsernames.includes(username.toLowerCase())) errors.username = "That username is already taken"
  return errors
}

const errors = ref<Errors>({})
const pending = ref(false)
const created = ref("")

const fieldsetId = useId()
const emailId = useId()
const usernameId = useId()

const fieldsetService = useMachine(
  fieldsetMachine.machine,
  computed(() => ({ id: fieldsetId, invalid: Object.keys(errors.value).length > 0 })),
)
const fieldsetApi = computed(() => fieldsetMachine.connect(fieldsetService, normalizeProps))

const emailService = useMachine(
  field.machine,
  computed(() => ({ id: emailId, invalid: !!errors.value.email })),
)
const emailApi = computed(() => field.connect(emailService, normalizeProps))

const usernameService = useMachine(
  field.machine,
  computed(() => ({ id: usernameId, invalid: !!errors.value.username })),
)
const usernameApi = computed(() => field.connect(usernameService, normalizeProps))

let timer: ReturnType<typeof setTimeout> | undefined
let requestId = 0
onBeforeUnmount(() => clearTimeout(timer))

function onSubmit(e: Event) {
  const data = new FormData(e.currentTarget as HTMLFormElement)
  const email = String(data.get("email") ?? "").trim()
  const username = String(data.get("username") ?? "").trim()
  const id = ++requestId
  clearTimeout(timer)
  pending.value = true
  created.value = ""
  errors.value = {}
  timer = setTimeout(() => {
    // a Reset (or a newer submit) makes this result stale
    if (id !== requestId) return
    const result = check(email, username)
    pending.value = false
    errors.value = result
    if (!Object.keys(result).length) created.value = `Account created for ${username}`
  }, 200)
}

function onReset() {
  requestId++
  clearTimeout(timer)
  pending.value = false
  errors.value = {}
  created.value = ""
}
</script>

<template>
  <main>
    <div class="field-page server-errors">
      <p class="hint">Submit empty, or use the username "lope", to see server errors.</p>
      <form novalidate @submit.prevent="onSubmit" @reset="onReset">
        <fieldset v-bind="fieldsetApi.getRootProps()">
          <legend v-bind="fieldsetApi.getLegendProps()">Create your account</legend>
          <span v-bind="fieldsetApi.getHelperTextProps()">We will email you a confirmation link.</span>
          <div v-bind="emailApi.getRootProps()">
            <label v-bind="emailApi.getLabelProps()">Email</label>
            <input v-bind="emailApi.getInputProps()" name="email" type="email" placeholder="ada@example.com" />
            <span v-bind="emailApi.getErrorTextProps()">{{ errors.email }}</span>
          </div>
          <div v-bind="usernameApi.getRootProps()">
            <label v-bind="usernameApi.getLabelProps()">Username</label>
            <input v-bind="usernameApi.getInputProps()" name="username" placeholder="ada" />
            <span v-bind="usernameApi.getErrorTextProps()">{{ errors.username }}</span>
          </div>
          <span v-bind="fieldsetApi.getErrorTextProps()">Fix the highlighted fields to continue</span>
        </fieldset>
        <div class="actions">
          <button type="submit" :disabled="pending">Create account</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <p class="output" role="status" data-testid="status">
        <span v-if="pending" class="pending">Checking with the server…</span>
        <span v-if="created" class="success">{{ created }}</span>
      </p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="fieldsetService" />
    <StateVisualizer :state="emailService" />
    <StateVisualizer :state="usernameService" />
  </Toolbar>
</template>
