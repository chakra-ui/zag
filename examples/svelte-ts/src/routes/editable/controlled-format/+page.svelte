<script lang="ts">
  import "@styles/editable.css"
  import Field from "./field.svelte"
</script>

<main class="editable">
  <Field name="no-digits" format={(value) => value.replace(/\d/g, "")} />
  <Field name="uppercase" format={(value) => value.toUpperCase()} />
</main>
