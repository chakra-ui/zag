<script setup lang="ts">
import "@styles/checkbox.css"

const accepted = ref(false)
const submitted = ref(false)
const result = ref<string | null>(null)

const invalid = computed(() => submitted.value && !accepted.value)

const onSubmit = (event: Event) => {
  submitted.value = true
  if (!accepted.value) {
    result.value = null
    return
  }
  // The hidden input posts `name=value` like a native checkbox
  const form = event.currentTarget as HTMLFormElement
  result.value = JSON.stringify(Object.fromEntries(new FormData(form)))
}
</script>

<template>
  <main class="checkbox">
    <form class="vstack gap-4" novalidate @submit.prevent="onSubmit">
      <CheckboxItem
        name="newsletter"
        value="weekly"
        label="Subscribe to the weekly newsletter"
        :default-checked="true"
      />
      <CheckboxItem
        name="terms"
        label="I agree to the terms"
        required
        :invalid="invalid"
        :checked="accepted"
        @checked-change="({ checked }) => (accepted = checked === true)"
      />
      <p v-if="invalid" class="checkbox-error">You need to accept the terms to continue.</p>

      <div class="hstack">
        <button type="submit" data-variant="solid">Submit</button>
        <code v-if="result" class="checkbox-description">{{ result }}</code>
      </div>
    </form>
  </main>
</template>
