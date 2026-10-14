<script setup lang="ts">
import "@styles/checkbox.css"

const checked = ref(false)
</script>

<template>
  <main class="checkbox">
    <div class="vstack gap-4">
      <CheckboxItem
        label="Email me product updates"
        description="State lives in the parent; the checkbox reports changes."
        :checked="checked"
        data-testid="hidden-input"
        @checked-change="(details) => (checked = details.checked === true)"
      />

      <div class="hstack">
        <button type="button" @click="checked = !checked">Toggle from outside</button>
        <span class="checkbox-description">checked: {{ String(checked) }}</span>
      </div>
    </div>
  </main>
</template>
