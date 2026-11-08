<script setup lang="ts">
import { getPlacement, getPlacementStyles, type Placement } from "@zag-js/popper"
import { computed, onBeforeUnmount, ref } from "vue"
import "@styles/popper.css"

const options = ["Newest first", "Oldest first", "Most popular", "Alphabetical"]

const floatingStyle = getPlacementStyles({ placement: "bottom-start", sameWidth: true }).floating

const triggerRef = ref<HTMLButtonElement | null>(null)
const menuRef = ref<HTMLDivElement | null>(null)
const arrowRef = ref<HTMLDivElement | null>(null)
const open = ref(false)
const placement = ref<Placement>("bottom-start")
const value = ref(options[0])

const arrow = computed(() => getPlacementStyles({ placement: placement.value }))

let stop: VoidFunction | undefined
let cleanup: VoidFunction | undefined

function close() {
  stop?.()
  stop = undefined
  cleanup?.()
  cleanup = undefined
  open.value = false
}

function show() {
  const trigger = triggerRef.value
  const menu = menuRef.value
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
  open.value = true
  stop = getPlacement(trigger, menu, {
    placement: "bottom-start",
    gutter: 10,
    flip: ["top-start"],
    sameWidth: true,
    overflowPadding: 16,
    getArrowElement: () => arrowRef.value,
    onComplete: (data) => {
      placement.value = data.placement
    },
  })
}

function choose(option: string) {
  value.value = option
  close()
  triggerRef.value?.focus()
}

onBeforeUnmount(close)
</script>

<template>
  <main>
    <div class="popper-dropdown">
      <p class="hint">The button sits at the bottom edge, so the list flips above it.</p>
      <button
        ref="triggerRef"
        type="button"
        class="trigger"
        data-testid="dropdown-trigger"
        aria-haspopup="true"
        :aria-expanded="open"
        aria-controls="sort-menu"
        @click="open ? close() : show()"
      >
        <span>Sort by</span>
        <span>{{ value }}</span>
      </button>
      <div
        id="sort-menu"
        ref="menuRef"
        class="menu"
        data-testid="dropdown-menu"
        :data-open="open ? 'true' : 'false'"
        :data-placement="placement"
        :style="floatingStyle"
      >
        <ul class="list">
          <li v-for="option in options" :key="option">
            <button type="button" :aria-current="option === value" @click="choose(option)">
              {{ option }}
            </button>
          </li>
        </ul>
        <div ref="arrowRef" class="arrow" data-testid="dropdown-arrow" :style="arrow.arrow">
          <div class="arrow-tip" :style="arrow.arrowTip" />
        </div>
      </div>
    </div>
  </main>
</template>
