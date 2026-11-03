import { trackFocusVisible } from "@zag-js/focus-visible"
import { useEffect, useState } from "preact/hooks"

function useFocusVisible() {
  const [focusVisible, setFocusVisible] = useState(false)
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    return trackFocusVisible({
      onChange(details) {
        setFocusVisible(details.isFocusVisible)
      },
    })
  }, [])

  const showFocus = focusVisible && focus

  return {
    focusVisible: showFocus,
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
    <div style={{ padding: 40 }}>
      <button {...button.getFocusProps()} style={{ background: button.focusVisible ? "red" : undefined }}>
        Click me
      </button>

      <br />
      <br />

      <label style={{ background: checkbox.focusVisible ? "red" : undefined }}>
        <input type="checkbox" {...checkbox.getFocusProps()} />
        <span>Focus me</span>
      </label>
    </div>
  )
}
