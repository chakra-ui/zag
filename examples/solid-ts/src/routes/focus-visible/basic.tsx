import { trackFocusVisible } from "@zag-js/focus-visible"
import { createSignal, onCleanup, onMount } from "solid-js"

function useFocusVisible() {
  const [focusVisible, setFocusVisible] = createSignal(false)
  const [focus, setFocus] = createSignal(false)

  onMount(() => {
    const cleanup = trackFocusVisible({
      onChange(details) {
        setFocusVisible(details.isFocusVisible)
      },
    })
    onCleanup(cleanup)
  })

  return {
    focusVisible: () => focusVisible() && focus(),
    getFocusProps: () => ({
      onFocus: () => setFocus(true),
      onBlur: () => setFocus(false),
    }),
  }
}

export default function Page() {
  const button = useFocusVisible()
  const checkbox = useFocusVisible()

  return (
    <div style={{ padding: "40px" }}>
      <button {...button.getFocusProps()} style={{ background: button.focusVisible() ? "red" : undefined }}>
        Click me
      </button>

      <br />
      <br />

      <label style={{ background: checkbox.focusVisible() ? "red" : undefined }}>
        <input type="checkbox" {...checkbox.getFocusProps()} />
        <span>Focus me</span>
      </label>
    </div>
  )
}
