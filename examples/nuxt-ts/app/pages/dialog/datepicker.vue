<script setup lang="ts">
import "@styles/dialog.css"
import "@styles/date-picker.css"
</script>

<template>
  <main>
    <DialogDatePickerDialog>
      <DialogDatePickerField />
      <DialogDatePickerDialog>
        <DialogDatePickerField />
      </DialogDatePickerDialog>
    </DialogDatePickerDialog>
  </main>
</template>
