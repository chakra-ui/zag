<script lang="ts">
  import { getInteractionModality, trackFocusVisible, type Modality } from "@zag-js/focus-visible"

  let modality = $state<Modality | null>(null)
  let focusVisible = $state(false)
  let focused = $state(false)

  $effect(() => {
    modality = getInteractionModality()
    return trackFocusVisible({
      onChange(details) {
        focusVisible = details.isFocusVisible
        modality = details.modality
      },
    })
  })

  const showRing = $derived(focusVisible && focused)
  const verdict = $derived(!focused ? "click the button first" : showRing ? "FAIL — stray ring" : "PASS — no ring")
</script>

<main style="font-family: ui-sans-serif, system-ui; padding: 32px; max-width: 640px; line-height: 1.5">
  <h1 style="font-size: 22px; margin: 0 0 8px">Safari tab-return focus ring</h1>
  <p style="margin: 0 0 20px; color: #444">
    Click the button with the mouse or trackpad. Switch to another Safari tab, then come back. A pointer click must not
    leave a keyboard ring.
  </p>

  <button
    type="button"
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    style="font-size: 18px; padding: 12px 20px; border: 2px solid #111; border-radius: 8px; outline-offset: 4px"
    style:background={showRing ? "#ffb3b3" : "#f4f4f4"}
    style:outline={showRing ? "4px solid crimson" : "none"}
  >
    Click me, then switch tabs
  </button>

  <dl
    style="margin-top: 24px; padding: 16px; background: #f6f6f6; border-radius: 8px; display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px"
  >
    <dt>modality</dt>
    <dd style="margin: 0">{modality ?? "null"}</dd>
    <dt>focus-visible</dt>
    <dd style="margin: 0">{String(focusVisible)}</dd>
    <dt>button focused</dt>
    <dd style="margin: 0">{String(focused)}</dd>
    <dt>ring</dt>
    <dd style="margin: 0; font-weight: 700" style:color={showRing ? "crimson" : "seagreen"}>{verdict}</dd>
  </dl>
</main>
