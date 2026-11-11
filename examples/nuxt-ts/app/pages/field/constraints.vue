<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const usernameService = useMachine(field.machine, { id: useId(), required: true, validationMode: "onBlur" })
const username = computed(() => field.connect(usernameService, normalizeProps))

const ageService = useMachine(field.machine, { id: useId(), validationMode: "onBlur" })
const age = computed(() => field.connect(ageService, normalizeProps))

const websiteService = useMachine(field.machine, { id: useId(), validationMode: "onBlur" })
const website = computed(() => field.connect(websiteService, normalizeProps))
</script>

<template>
  <main class="field-page">
    <form @submit.prevent>
      <div v-bind="username.getRootProps()">
        <label v-bind="username.getLabelProps()">Username</label>
        <input v-bind="username.getInputProps()" name="username" pattern="[a-z0-9_]+" minlength="3" maxlength="16" />
        <span v-bind="username.getHelperTextProps()">3–16 lowercase letters, numbers, or underscores.</span>
        <span v-bind="username.getErrorTextProps({ match: 'valueMissing' })">Choose a username.</span>
        <span v-bind="username.getErrorTextProps({ match: 'tooShort' })">Use at least 3 characters.</span>
        <span v-bind="username.getErrorTextProps({ match: 'patternMismatch' })">
          Use lowercase letters, numbers, or underscores.
        </span>
      </div>

      <div v-bind="age.getRootProps()">
        <label v-bind="age.getLabelProps()">Age</label>
        <input v-bind="age.getInputProps()" name="age" type="number" min="13" max="120" step="1" />
        <span v-bind="age.getErrorTextProps({ match: 'rangeUnderflow' })">You must be at least 13.</span>
        <span v-bind="age.getErrorTextProps({ match: 'rangeOverflow' })">Enter an age of 120 or less.</span>
        <span v-bind="age.getErrorTextProps({ match: 'stepMismatch' })">Enter a whole number.</span>
      </div>

      <div v-bind="website.getRootProps()">
        <label v-bind="website.getLabelProps()">Website</label>
        <input v-bind="website.getInputProps()" name="website" type="url" placeholder="https://example.com" />
        <span v-bind="website.getErrorTextProps({ match: 'typeMismatch' })">
          Enter a full URL, like https://example.com
        </span>
      </div>

      <div class="actions">
        <button type="submit">Save</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>
</template>
