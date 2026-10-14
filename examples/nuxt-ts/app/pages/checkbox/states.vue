<script setup lang="ts">
import "@styles/checkbox.css"
</script>

<template>
  <main class="checkbox">
    <div class="vstack gap-4">
      <CheckboxItem label="Default" />
      <CheckboxItem label="Checked" :default-checked="true" />
      <CheckboxItem label="Indeterminate" default-checked="indeterminate" />
      <CheckboxItem label="Disabled" disabled />
      <CheckboxItem label="Disabled and checked" disabled :default-checked="true" />
      <CheckboxItem
        label="Read-only"
        read-only
        :default-checked="true"
        description="Shows its value but can't be changed."
      />
      <CheckboxItem label="Invalid" invalid description="Marks the field as having an error." />
    </div>
  </main>
</template>
