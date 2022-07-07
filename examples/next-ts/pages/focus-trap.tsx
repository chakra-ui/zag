import { useEffect, useRef, useState } from "react"
import { trapFocus } from "@zag-js/focus-scope"

function FocusScope({ children }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return trapFocus(ref.current)
  }, [])

  return (
    <div ref={ref} tabIndex={-1}>
      {children}
    </div>
  )
}

function Page() {
  const [isOpen, setOpen] = useState(false)
  const [isOpen2, setOpen2] = useState(false)

  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setOpen(true)}>Open</button>
      {isOpen && (
        <FocusScope>
          <label htmlFor="first-input">First Input</label>
          <input id="first-input" />
          <label htmlFor="second-input">Second Input</label>
          <input id="second-input" />
          <button onClick={() => setOpen(false)}>Close</button>

          <button onClick={() => setOpen2(true)}>Open</button>
          {isOpen2 && (
            <FocusScope>
              <label htmlFor="first-input">First Input</label>
              <input id="first-input" />
              <label htmlFor="second-input">Second Input</label>
              <input id="second-input" />
              <button onClick={() => setOpen2(false)}>Close</button>
            </FocusScope>
          )}
        </FocusScope>
      )}
    </div>
  )
}

export default Page
