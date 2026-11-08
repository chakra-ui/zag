import { getPlacement, getPlacementStyles, type Placement } from "@zag-js/popper"
import { createSignal, onSettled } from "solid-js"
import "@styles/popper.css"

const options = ["Newest first", "Oldest first", "Most popular", "Alphabetical"]

const floatingStyle = getPlacementStyles({ placement: "bottom-start", sameWidth: true }).floating

export default function Page() {
  let triggerRef: HTMLButtonElement | undefined
  let menuRef: HTMLDivElement | undefined
  let arrowRef: HTMLDivElement | undefined
  let stop: VoidFunction | undefined
  let cleanup: VoidFunction | undefined
  const [open, setOpen] = createSignal(false)
  const [placement, setPlacement] = createSignal<Placement>("bottom-start")
  const [value, setValue] = createSignal(options[0])

  function close() {
    stop?.()
    stop = undefined
    cleanup?.()
    cleanup = undefined
    setOpen(false)
  }

  function show() {
    const trigger = triggerRef
    const menu = menuRef
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
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    cleanup = () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
    setOpen(true)
    stop = getPlacement(trigger, menu, {
      placement: "bottom-start",
      gutter: 10,
      flip: ["top-start"],
      sameWidth: true,
      overflowPadding: 16,
      shift: 32,
      getArrowElement: () => arrowRef ?? null,
      onComplete: (data) => setPlacement(data.placement),
    })
  }

  onSettled(() => close)

  const arrow = () => getPlacementStyles({ placement: placement() })

  return (
    <main>
      <div class="popper-dropdown">
        <p class="hint">Open the menu near the bottom edge; it flips above and stays on screen.</p>
        <button
          type="button"
          class="trigger"
          ref={triggerRef}
          data-testid="dropdown-trigger"
          aria-expanded={open() ? "true" : "false"}
          aria-controls="sort-menu"
          onClick={() => (open() ? close() : show())}
        >
          <span>Sort by</span>
          <span>{value()}</span>
        </button>
        <div
          class="menu"
          id="sort-menu"
          ref={menuRef}
          data-testid="dropdown-menu"
          data-open={open() ? "true" : "false"}
          data-placement={placement()}
          style={floatingStyle}
        >
          <div class="content">
            <ul class="list">
              {options.map((option) => (
                <li>
                  <button
                    type="button"
                    aria-current={option === value() ? "true" : undefined}
                    onClick={() => {
                      setValue(option)
                      close()
                      triggerRef?.focus()
                    }}
                  >
                    {option}
                  </button>
                </li>
              ))}
            </ul>
            <div class="arrow" ref={arrowRef} data-testid="dropdown-arrow" style={arrow().arrow}>
              <div class="arrow-tip" style={arrow().arrowTip} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
