<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { z } from "zod"
import "@styles/field.css"

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "One uppercase letter")
  .regex(/[0-9]/, "One number")

const service = useMachine(field.machine, {
  id: useId(),
  required: true,
  validationMode: "onChange",
  validate: ({ value }: field.ValidateDetails) =>
    passwordSchema.safeParse(value).error?.issues.map((issue) => issue.message),
})

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Password</label>
        <input v-bind="api.getInputProps()" name="password" type="password" />
        <div v-bind="api.getErrorTextProps()">
          <ul>
            <li v-for="error in api.errors" :key="error">{{ error }}</li>
          </ul>
        </div>
        <span v-bind="api.getIndicatorProps({ type: 'valid' })">Strong password</span>
      </div>
      <div class="actions">
        <button type="submit">Save</button>
      </div>
    </form>
  </main>
</template>
