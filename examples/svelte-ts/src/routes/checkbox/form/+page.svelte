<script lang="ts">
  import Checkbox from "$lib/components/checkbox.svelte"
  import "@styles/checkbox.css"

  let accepted = $state(false)
  let submitted = $state(false)
  let result = $state<string | null>(null)

  const invalid = $derived(submitted && !accepted)
</script>

<main class="checkbox">
  <form
    class="vstack gap-4"
    novalidate
    onsubmit={(event) => {
      event.preventDefault()
      submitted = true
      if (!accepted) {
        result = null
        return
      }
      // The hidden input posts `name=value` like a native checkbox
      result = JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
    }}
  >
    <Checkbox name="newsletter" value="weekly" label="Subscribe to the weekly newsletter" defaultChecked />
    <Checkbox
      name="terms"
      label="I agree to the terms"
      required
      {invalid}
      checked={accepted}
      onCheckedChange={({ checked }) => (accepted = checked === true)}
    />
    {#if invalid}
      <p class="checkbox-error">You need to accept the terms to continue.</p>
    {/if}

    <div class="hstack">
      <button type="submit" data-variant="solid">Submit</button>
      {#if result}
        <code class="checkbox-description">{result}</code>
      {/if}
    </div>
  </form>
</main>
