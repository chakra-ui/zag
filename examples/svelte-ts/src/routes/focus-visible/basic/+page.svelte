<script lang="ts">
  import { trackFocusVisible } from "@zag-js/focus-visible"

  let focusVisible = $state(false)
  let buttonFocused = $state(false)
  let checkboxFocused = $state(false)

  $effect(() => {
    return trackFocusVisible({
      onChange(details) {
        focusVisible = details.isFocusVisible
      },
    })
  })

  const buttonRing = $derived(focusVisible && buttonFocused)
  const checkboxRing = $derived(focusVisible && checkboxFocused)
</script>

<div style="padding: 40px">
  <button
    style:background={buttonRing ? "red" : undefined}
    onfocus={() => (buttonFocused = true)}
    onblur={() => (buttonFocused = false)}
  >
    Click me
  </button>

  <br />
  <br />

  <label style:background={checkboxRing ? "red" : undefined}>
    <input type="checkbox" onfocus={() => (checkboxFocused = true)} onblur={() => (checkboxFocused = false)} />
    <span>Focus me</span>
  </label>
</div>
