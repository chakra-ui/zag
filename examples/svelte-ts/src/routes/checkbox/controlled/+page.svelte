<script lang="ts">
  import Checkbox from "#lib/components/checkbox.svelte"
  import "@styles/checkbox.css"

  let checked = $state(false)
</script>

<main class="checkbox">
  <div class="vstack gap-4">
    <Checkbox
      label="Email me product updates"
      description="State lives in the parent; the checkbox reports changes."
      {checked}
      onCheckedChange={(details) => (checked = details.checked === true)}
      data-testid="hidden-input"
    />

    <div class="hstack">
      <button type="button" onclick={() => (checked = !checked)}>Toggle from outside</button>
      <span class="checkbox-description">checked: {String(checked)}</span>
    </div>
  </div>
</main>
