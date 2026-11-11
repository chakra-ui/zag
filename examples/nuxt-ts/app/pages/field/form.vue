<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const submitToServer = (email: string) =>
  new Promise<Record<string, string>>((resolve) =>
    setTimeout(() => resolve(email === "taken@example.com" ? { email: "This email is already taken" } : {}), 300),
  )

const serverErrors = ref<Record<string, string>>({})
const status = ref("")

const emailId = useId()
const emailService = useMachine(
  field.machine,
  computed(() => ({ id: emailId, required: true, errors: serverErrors.value.email })),
)
const email = computed(() => field.connect(emailService, normalizeProps))

const passwordService = useMachine(field.machine, { id: useId(), required: true })
const password = computed(() => field.connect(passwordService, normalizeProps))

const confirmService = useMachine(field.machine, {
  id: useId(),
  required: true,
  validate: ({ value, formValues }: field.ValidateDetails) =>
    value !== formValues.password ? "Passwords don't match" : null,
})
const confirm = computed(() => field.connect(confirmService, normalizeProps))

async function onSubmit(event: Event) {
  const form = event.currentTarget as HTMLFormElement
  serverErrors.value = {}
  status.value = "Submitting…"
  const errors = await submitToServer(String(new FormData(form).get("email")))
  serverErrors.value = errors
  status.value = Object.keys(errors).length > 0 ? "" : "Submitted!"
}
</script>

<template>
  <main class="field-page">
    <form @submit.prevent="onSubmit">
      <div v-bind="email.getRootProps()">
        <label v-bind="email.getLabelProps()">Email</label>
        <input v-bind="email.getInputProps()" name="email" type="email" placeholder="taken@example.com is taken" />
        <span v-bind="email.getErrorTextProps()">{{ email.errors[0] }}</span>
      </div>

      <div v-bind="password.getRootProps()">
        <label v-bind="password.getLabelProps()">Password</label>
        <input v-bind="password.getInputProps()" name="password" type="password" minlength="8" />
        <span v-bind="password.getHelperTextProps()">At least 8 characters.</span>
        <span v-bind="password.getErrorTextProps()">{{ password.errors[0] }}</span>
      </div>

      <div v-bind="confirm.getRootProps()">
        <label v-bind="confirm.getLabelProps()">Confirm password</label>
        <input v-bind="confirm.getInputProps()" name="confirm" type="password" />
        <span v-bind="confirm.getErrorTextProps()">{{ confirm.errors[0] }}</span>
      </div>

      <div class="actions">
        <button type="submit">Create account</button>
      </div>
      <output data-testid="status">{{ status }}</output>
    </form>
  </main>
</template>
