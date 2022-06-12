import { useEffect, useState } from "react"
import { trackFocusVisible } from "@zag-js/focus-visible"

function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false)
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    return trackFocusVisible(setFocusVisible)
  }, [])
  const showFocus = focusVisible && focus

  return {
    focusVisible: showFocus,
    focusProps: {
      onFocus: () => setFocus(true),
      onBlur: () => setFocus(false),
    },
  }
}

export default function Page() {
  const button = useFocusVisible()
  const checkbox = useFocusVisible()

  return (
    <div style={{ padding: 40 }}>
      <button {...button.focusProps} style={{ background: button.focusVisible ? "red" : undefined }}>
        Click me
      </button>

      <br />
      <br />

      <label style={{ background: checkbox.focusVisible ? "red" : undefined }}>
        <input type="checkbox" {...checkbox.focusProps} />
        <span>Focus me</span>
      </label>
    </div>
  )
}
