<script lang="ts">
  import Dialog from "$lib/components/dialog-date-picker-dialog.svelte"
  import DatePicker from "$lib/components/dialog-date-picker-field.svelte"
  import "@styles/dialog.css"
  import "@styles/date-picker.css"
</script>

<main>
  <Dialog>
    <DatePicker />
    <Dialog>
      <DatePicker />
    </Dialog>
  </Dialog>
</main>
