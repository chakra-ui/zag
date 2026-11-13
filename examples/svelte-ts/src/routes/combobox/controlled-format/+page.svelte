<script lang="ts">
  import "@styles/combobox.css"
  import Field from "./field.svelte"

  const digits = ["10001", "20002", "30003", "94105"]
  const codes = ["ABC", "LAX", "NYC", "SFO"]
</script>

<main class="combobox">
  <Field label="Digits" items={digits} format={(value) => value.replace(/\D/g, "")} />
  <Field label="Uppercase" items={codes} format={(value) => value.toUpperCase()} />
</main>
