<script lang="ts">
  import { getPlacement, getPlacementStyles, type Placement } from "@zag-js/popper"
  import { normalizeProps } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/popper.css"

  const options = ["Newest first", "Oldest first", "Most popular", "Alphabetical"]

  const floatingStyle = getPlacementStyles({ placement: "bottom-start", sameWidth: true }).floating

  let triggerRef: HTMLButtonElement
  let menuRef: HTMLDivElement
  let arrowRef: HTMLDivElement
  let open = $state(false)
  let placement = $state<Placement>("bottom-start")
  let value = $state(options[0])

  const arrow = $derived(getPlacementStyles({ placement: placement }))

  let stop: VoidFunction | undefined
  let cleanup: VoidFunction | undefined

  function close() {
    stop?.()
    stop = undefined
    cleanup?.()
    cleanup = undefined
    open = false
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
    open = true
    stop = getPlacement(trigger, menu, {
      placement: "bottom-start",
      gutter: 10,
      flip: ["top-start"],
      sameWidth: true,
      overflowPadding: 16,
      shift: 32,
      getArrowElement: () => arrowRef,
      onComplete: (data) => {
        placement = data.placement
      },
    })
  }

  onMount(() => close)
</script>

<main>
  <div class="popper-dropdown">
    <p class="hint">Open the menu near the bottom edge; it flips above and stays on screen.</p>
    <button
      type="button"
      class="trigger"
      bind:this={triggerRef}
      data-testid="dropdown-trigger"
      aria-expanded={open}
      aria-controls="sort-menu"
      onclick={() => (open ? close() : show())}
    >
      <span>Sort by</span>
      <span>{value}</span>
    </button>
    <div
      class="menu"
      id="sort-menu"
      bind:this={menuRef}
      data-testid="dropdown-menu"
      data-open={open ? "true" : "false"}
      data-placement={placement}
      {...normalizeProps.element({ style: floatingStyle })}
    >
      <div class="content">
        <ul class="list">
          {#each options as option (option)}
            <li>
              <button
                type="button"
                aria-current={option === value ? "true" : undefined}
                onclick={() => {
                  value = option
                  close()
                  triggerRef.focus()
                }}
              >
                {option}
              </button>
            </li>
          {/each}
        </ul>
        <div
          class="arrow"
          bind:this={arrowRef}
          data-testid="dropdown-arrow"
          {...normalizeProps.element({ style: arrow.arrow })}
        >
          <div class="arrow-tip" {...normalizeProps.element({ style: arrow.arrowTip })}></div>
        </div>
      </div>
    </div>
  </div>
</main>
