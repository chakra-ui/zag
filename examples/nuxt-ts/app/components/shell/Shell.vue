<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { getComponentExamples } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import {
  ChevronsUpDownIcon,
  FocusIcon,
  Maximize2Icon,
  Minimize2Icon,
  PanelBottomIcon,
  PanelRightIcon,
  SearchIcon,
  SquareDashedIcon,
} from "lucide-vue-next"
import CommandPalette, { type PaletteMode } from "./CommandPalette.vue"
import ZagLogo from "./ZagLogo.vue"
import { readPref, writePref } from "./prefs"

type CanvasLayout = "centered" | "padded"
type InspectorDock = "right" | "bottom"

const layouts = [
  { value: "centered", label: "Centered", icon: FocusIcon },
  { value: "padded", label: "Padded", icon: SquareDashedIcon },
] as const

const docks = [
  { value: "right", label: "Right", icon: PanelRightIcon },
  { value: "bottom", label: "Bottom", icon: PanelBottomIcon },
] as const

const route = useRoute()

// The head script already applied saved prefs to <html>; these only sync the toggles
const layout = ref<CanvasLayout>("centered")
const dock = ref<InspectorDock>("right")
const inspectorOpen = ref(true)
const fullscreenInspectorOpen = ref(false)
const fullscreen = ref(false)
const hasInspector = ref(false)
const mode = ref<PaletteMode>({ type: "all" })

const segments = computed(() => route.path.split("/").filter(Boolean))
const component = computed(() => segments.value[0])
const currentPath = computed(() =>
  segments.value[0] && segments.value[1] ? `/${segments.value[0]}/${segments.value[1]}` : null,
)

const isFullscreen = computed(() => fullscreen.value && !!currentPath.value)
const inspectorShown = computed(() => (isFullscreen.value ? fullscreenInspectorOpen.value : inspectorOpen.value))

const examples = computed(() => (component.value ? getComponentExamples(component.value) : []))
const componentLabel = computed(() => examples.value[0]?.componentLabel)
const exampleLabel = computed(() => examples.value.find((item) => item.path === currentPath.value)?.title)

function setLayout(next: CanvasLayout) {
  layout.value = next
  writePref("layout", next)
}

// Full screen keeps its own setting so leaving it restores the panel
function toggleInspector() {
  if (isFullscreen.value) {
    fullscreenInspectorOpen.value = !fullscreenInspectorOpen.value
    return
  }
  inspectorOpen.value = !inspectorOpen.value
  writePref("inspector", inspectorOpen.value ? "shown" : "hidden")
}

function selectDock(next: InspectorDock) {
  if (inspectorShown.value && dock.value === next) return toggleInspector()
  dock.value = next
  writePref("dock", next)
  if (!inspectorShown.value) toggleInspector()
}

function exitFullscreen() {
  fullscreen.value = false
  fullscreenInspectorOpen.value = false
}

const service = useMachine(dialog.machine, { id: useId() })
const api = computed(() => dialog.connect(service, normalizeProps))

function openPalette(next: PaletteMode) {
  mode.value = next
  api.value.setOpen(true)
}

// Not every example renders an inspector, so read it from the page once it mounts
const body = ref<HTMLElement | null>(null)
let observer: MutationObserver | undefined
const checkInspector = () => {
  hasInspector.value = !!body.value?.querySelector(":scope > .toolbar")
}

let hotkeys: ReturnType<typeof createHotkeyStore> | undefined

onMounted(() => {
  const storedLayout = readPref("layout")
  if (storedLayout) layout.value = storedLayout
  const storedDock = readPref("dock")
  if (storedDock) dock.value = storedDock
  if (readPref("inspector") === "hidden") inspectorOpen.value = false

  checkInspector()
  if (body.value) {
    observer = new MutationObserver(checkInspector)
    observer.observe(body.value, { childList: true })
  }

  hotkeys = createHotkeyStore()
  hotkeys.register({
    id: "playground-search",
    hotkey: "mod+K",
    label: "Search examples",
    action: () => openPalette({ type: "all" }),
    options: { preventDefault: true },
  })
  hotkeys.register({
    id: "playground-fullscreen",
    hotkey: "mod+shift+F",
    label: "Toggle full screen",
    action: () => (fullscreen.value = !fullscreen.value),
    options: { preventDefault: true },
  })
  hotkeys.register({
    id: "playground-inspector",
    hotkey: "mod+.",
    label: "Toggle inspector",
    action: () => toggleInspector(),
    options: { preventDefault: true },
  })
  hotkeys.init({ target: document })
})

watch(
  () => route.path,
  () => nextTick(checkInspector),
)

onBeforeUnmount(() => {
  observer?.disconnect()
  hotkeys?.destroy()
})
</script>

<template>
  <div
    class="pg"
    :data-fullscreen="isFullscreen ? '' : undefined"
    :data-inspector="inspectorShown ? 'shown' : 'hidden'"
  >
    <header class="pg-topbar">
      <div class="pg-topbar-start">
        <NuxtLink to="/" class="pg-brand" aria-label="All components"><ZagLogo /></NuxtLink>

        <span class="pg-slash" aria-hidden="true" />

        <button
          type="button"
          class="pg-crumb"
          aria-label="Change component"
          :title="componentLabel ? `Component: ${componentLabel}` : undefined"
          @click="openPalette({ type: 'components' })"
        >
          <span :data-placeholder="componentLabel ? undefined : ''">{{ componentLabel ?? "Select component" }}</span>
          <ChevronsUpDownIcon aria-hidden="true" />
        </button>

        <template v-if="component">
          <span class="pg-slash" aria-hidden="true" />
          <button
            type="button"
            class="pg-crumb"
            aria-label="Change example"
            :title="exampleLabel ? `Example: ${exampleLabel}` : undefined"
            @click="openPalette({ type: 'examples', component })"
          >
            <span :data-placeholder="exampleLabel ? undefined : ''">{{ exampleLabel ?? "Select example" }}</span>
            <ChevronsUpDownIcon aria-hidden="true" />
          </button>
        </template>
      </div>

      <div class="pg-topbar-center">
        <button type="button" class="pg-search-trigger" @click="openPalette({ type: 'all' })">
          <SearchIcon aria-hidden="true" />
          <span>Search examples…</span>
          <kbd class="pg-kbd">⌘K</kbd>
        </button>
      </div>

      <div class="pg-topbar-end">
        <template v-if="currentPath">
          <div class="pg-segmented" role="group" aria-label="Canvas layout">
            <button
              v-for="item in layouts"
              :key="item.value"
              type="button"
              class="pg-segmented-item"
              :aria-pressed="layout === item.value"
              :aria-label="`${item.label} layout`"
              :title="`${item.label} layout`"
              @click="setLayout(item.value)"
            >
              <component :is="item.icon" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            class="pg-btn"
            data-icon
            aria-label="Full screen"
            title="Full screen (⌘⇧F)"
            @click="fullscreen = true"
          >
            <Maximize2Icon aria-hidden="true" />
          </button>

          <div
            class="pg-segmented"
            role="group"
            aria-label="Inspector"
            :aria-disabled="!hasInspector || undefined"
            :title="hasInspector ? undefined : 'This example has no inspector'"
          >
            <button
              v-for="item in docks"
              :key="item.value"
              type="button"
              class="pg-segmented-item"
              :disabled="!hasInspector"
              :aria-pressed="hasInspector && inspectorShown && dock === item.value"
              :aria-label="`Inspector ${item.label.toLowerCase()}`"
              :title="`Inspector ${item.label.toLowerCase()} (⌘. to toggle)`"
              @click="selectDock(item.value)"
            >
              <component :is="item.icon" aria-hidden="true" />
            </button>
          </div>
        </template>
      </div>
    </header>

    <div ref="body" class="pg-body" :data-layout="layout">
      <slot />
    </div>

    <div v-if="isFullscreen" class="pg-floating-bar" role="toolbar" aria-label="Full screen">
      <button
        v-if="hasInspector"
        type="button"
        :aria-pressed="inspectorShown"
        title="Toggle inspector (⌘.)"
        @click="toggleInspector"
      >
        <PanelBottomIcon v-if="dock === 'bottom'" aria-hidden="true" />
        <PanelRightIcon v-else aria-hidden="true" />
        Inspector
      </button>
      <button type="button" title="Exit full screen (⌘⇧F)" @click="exitFullscreen">
        <Minimize2Icon aria-hidden="true" />
        Exit full screen
        <kbd class="pg-kbd">⌘⇧F</kbd>
      </button>
    </div>

    <CommandPalette v-if="api.open" :api="api" :mode="mode" :current-path="currentPath" />
  </div>
</template>
