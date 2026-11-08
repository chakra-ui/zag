import { getPlacement, getPlacementStyles, type Placement } from "@zag-js/popper"
import { useEffect, useRef, useState } from "preact/hooks"
import "@styles/popper.css"

const options = ["Newest first", "Oldest first", "Most popular", "Alphabetical"]

const styles = getPlacementStyles({ placement: "bottom-start", sameWidth: true })

export default function Page() {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)
  const stopRef = useRef<VoidFunction>(undefined)
  const closeRef = useRef<VoidFunction>(() => {})
  const openRef = useRef<VoidFunction>(() => {})
  const [open, setOpen] = useState(false)
  const [placement, setPlacement] = useState<Placement>("bottom-start")
  const [value, setValue] = useState(options[0])

  useEffect(() => {
    const trigger = triggerRef.current
    const menu = menuRef.current
    if (!trigger || !menu) return

    const onPointerDown = (e: PointerEvent) => {
      if (!trigger.contains(e.target as Node) && !menu.contains(e.target as Node)) close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close()
        trigger.focus()
      }
    }
    function close() {
      stopRef.current?.()
      stopRef.current = undefined
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
      setOpen(false)
    }
    function show() {
      document.addEventListener("pointerdown", onPointerDown)
      document.addEventListener("keydown", onKeyDown)
      setOpen(true)
      stopRef.current = getPlacement(trigger, menu, {
        placement: "bottom-start",
        gutter: 10,
        flip: ["top-start"],
        sameWidth: true,
        overflowPadding: 16,
        shift: 32,
        getArrowElement: () => arrowRef.current,
        onComplete: (data) => setPlacement(data.placement),
      })
    }
    closeRef.current = close
    openRef.current = show
    return close
  }, [])

  const arrow = getPlacementStyles({ placement })

  return (
    <main>
      <div className="popper-dropdown">
        <p className="hint">Open the menu near the bottom edge; it flips above and stays on screen.</p>
        <button
          type="button"
          className="trigger"
          ref={triggerRef}
          data-testid="dropdown-trigger"
          aria-expanded={open}
          aria-controls="sort-menu"
          onClick={() => (open ? closeRef.current() : openRef.current())}
        >
          <span>Sort by</span>
          <span>{value}</span>
        </button>
        <div
          className="menu"
          id="sort-menu"
          ref={menuRef}
          data-testid="dropdown-menu"
          data-open={open ? "true" : "false"}
          data-placement={placement}
          style={styles.floating}
        >
          <div className="content">
            <ul className="list">
              {options.map((option) => (
                <li key={option}>
                  <button
                    type="button"
                    aria-current={option === value}
                    onClick={() => {
                      setValue(option)
                      closeRef.current()
                      triggerRef.current?.focus()
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
            <div className="arrow" ref={arrowRef} data-testid="dropdown-arrow" style={arrow.arrow}>
              <div className="arrow-tip" style={arrow.arrowTip} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
