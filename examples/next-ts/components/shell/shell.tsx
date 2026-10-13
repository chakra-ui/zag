"use client"

import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { normalizeProps, useMachine } from "@zag-js/react"
import { getComponentExamples } from "@zag-js/shared"
import {
  ChevronsUpDownIcon,
  FocusIcon,
  Maximize2Icon,
  Minimize2Icon,
  PanelBottomIcon,
  PanelRightIcon,
  SearchIcon,
  SquareDashedIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { CommandPalette, type PaletteMode } from "./command-palette"
import { readPref, writePref } from "./prefs"

type CanvasLayout = "centered" | "padded"

const layouts: { value: CanvasLayout; label: string; icon: typeof FocusIcon }[] = [
  { value: "centered", label: "Centered", icon: FocusIcon },
  { value: "padded", label: "Padded", icon: SquareDashedIcon },
]

// Centered by default, like Storybook; padded is opt-in and remembered
function useCanvasLayout() {
  const [layout, setLayout] = useState<CanvasLayout>("centered")

  // The head script already applied it to <html>; this only syncs the toggle's pressed state
  useEffect(() => {
    const stored = readPref("layout")
    if (stored) setLayout(stored)
  }, [])

  const update = (next: CanvasLayout) => {
    setLayout(next)
    writePref("layout", next)
  }

  return [layout, update] as const
}

type InspectorDock = "right" | "bottom"

const docks: { value: InspectorDock; label: string; icon: typeof FocusIcon }[] = [
  { value: "right", label: "Right", icon: PanelRightIcon },
  { value: "bottom", label: "Bottom", icon: PanelBottomIcon },
]

// Right by default; bottom suits wide examples, since the panel takes height instead of covering them
function useInspectorDock() {
  const [dock, setDock] = useState<InspectorDock>("right")

  useEffect(() => {
    const stored = readPref("dock")
    if (stored) setDock(stored)
  }, [])

  const update = (next: InspectorDock) => {
    setDock(next)
    writePref("dock", next)
  }

  return [dock, update] as const
}

// Shown by default; full screen keeps its own setting so leaving it restores the panel
function useInspector() {
  const [open, setOpen] = useState(true)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  useEffect(() => {
    if (readPref("inspector") === "hidden") setOpen(false)
  }, [])

  const toggle = (fullscreen: boolean) => {
    if (fullscreen) return setFullscreenOpen((value) => !value)
    setOpen((value) => {
      writePref("inspector", value ? "hidden" : "shown")
      return !value
    })
  }

  return { open, fullscreenOpen, toggle, resetFullscreen: () => setFullscreenOpen(false) }
}

// Not every example renders an inspector, so read it from the page once it mounts
function useHasInspector(pathname: string) {
  const [hasInspector, setHasInspector] = useState(false)
  useEffect(() => {
    const check = () => setHasInspector(!!document.querySelector(".pg-body > .toolbar"))
    check()
    const body = document.querySelector(".pg-body")
    if (!body) return
    const observer = new MutationObserver(check)
    observer.observe(body, { childList: true })
    return () => observer.disconnect()
  }, [pathname])
  return hasInspector
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/"
  const [layout, setLayout] = useCanvasLayout()
  const [fullscreen, setFullscreen] = useState(false)
  const inspector = useInspector()
  const [dock, setDock] = useInspectorDock()
  const hasInspector = useHasInspector(pathname)
  const [mode, setMode] = useState<PaletteMode>({ type: "all" })

  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  const openPalette = (next: PaletteMode) => {
    setMode(next)
    api.setOpen(true)
  }

  useEffect(() => {
    const store = createHotkeyStore()
    store.register({
      id: "playground-search",
      hotkey: "mod+K",
      label: "Search examples",
      action: () => openPalette({ type: "all" }),
      options: { preventDefault: true },
    })
    store.register({
      id: "playground-fullscreen",
      hotkey: "mod+shift+F",
      label: "Toggle full screen",
      action: () => setFullscreen((value) => !value),
      options: { preventDefault: true },
    })
    store.register({
      id: "playground-inspector",
      hotkey: "mod+.",
      label: "Toggle inspector",
      action: () => toggleInspectorRef.current(),
      options: { preventDefault: true },
    })
    store.init({ target: document })
    return () => store.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [component, example] = pathname.split("/").filter(Boolean)
  const currentPath = component && example ? `/${component}/${example}` : null

  const isFullscreen = fullscreen && !!currentPath
  const inspectorShown = isFullscreen ? inspector.fullscreenOpen : inspector.open

  const toggleInspector = () => inspector.toggle(isFullscreen)
  const toggleInspectorRef = useRef(toggleInspector)
  toggleInspectorRef.current = toggleInspector

  const selectDock = (next: InspectorDock) => {
    if (inspectorShown && dock === next) return toggleInspector()
    setDock(next)
    if (!inspectorShown) toggleInspector()
  }

  const exitFullscreen = () => {
    setFullscreen(false)
    inspector.resetFullscreen()
  }

  return (
    <div
      className="pg"
      data-fullscreen={isFullscreen ? "" : undefined}
      data-inspector={inspectorShown ? "shown" : "hidden"}
    >
      <Topbar
        component={component}
        currentPath={currentPath}
        layout={layout}
        onLayoutChange={setLayout}
        onFullscreen={() => setFullscreen(true)}
        inspectorShown={inspectorShown}
        hasInspector={hasInspector}
        dock={dock}
        onSelectDock={selectDock}
        onOpenPalette={openPalette}
      />
      <div className="pg-body" data-layout={layout}>
        {children}
      </div>
      {isFullscreen && (
        <div className="pg-floating-bar" role="toolbar" aria-label="Full screen">
          {hasInspector && (
            <button type="button" aria-pressed={inspectorShown} title="Toggle inspector (⌘.)" onClick={toggleInspector}>
              {dock === "bottom" ? <PanelBottomIcon aria-hidden /> : <PanelRightIcon aria-hidden />}
              Inspector
            </button>
          )}
          <button type="button" title="Exit full screen (⌘⇧F)" onClick={exitFullscreen}>
            <Minimize2Icon aria-hidden />
            Exit full screen
            <kbd className="pg-kbd">⌘⇧F</kbd>
          </button>
        </div>
      )}
      {api.open && <CommandPalette api={api} mode={mode} currentPath={currentPath} />}
    </div>
  )
}

interface TopbarProps {
  component: string | undefined
  currentPath: string | null
  layout: CanvasLayout
  onLayoutChange: (layout: CanvasLayout) => void
  onFullscreen: VoidFunction
  inspectorShown: boolean
  hasInspector: boolean
  dock: InspectorDock
  /** Picks a side; picking the active one hides the inspector */
  onSelectDock: (dock: InspectorDock) => void
  onOpenPalette: (mode: PaletteMode) => void
}

function Topbar(props: TopbarProps) {
  const {
    component,
    currentPath,
    layout,
    onLayoutChange,
    onFullscreen,
    inspectorShown,
    hasInspector,
    dock,
    onSelectDock,
    onOpenPalette,
  } = props
  const examples = component ? getComponentExamples(component) : []
  const componentLabel = examples[0]?.componentLabel
  const exampleLabel = examples.find((route) => route.path === currentPath)?.title

  return (
    <header className="pg-topbar">
      <div className="pg-topbar-start">
        <Link href="/" className="pg-brand" aria-label="All components">
          <ZagLogo />
        </Link>

        <span className="pg-slash" aria-hidden />

        <button
          type="button"
          className="pg-crumb"
          aria-label="Change component"
          title={componentLabel ? `Component: ${componentLabel}` : undefined}
          onClick={() => onOpenPalette({ type: "components" })}
        >
          <span data-placeholder={componentLabel ? undefined : ""}>{componentLabel ?? "Select component"}</span>
          <ChevronsUpDownIcon aria-hidden />
        </button>

        {component && (
          <>
            <span className="pg-slash" aria-hidden />
            <button
              type="button"
              className="pg-crumb"
              aria-label="Change example"
              title={exampleLabel ? `Example: ${exampleLabel}` : undefined}
              onClick={() => onOpenPalette({ type: "examples", component })}
            >
              <span data-placeholder={exampleLabel ? undefined : ""}>{exampleLabel ?? "Select example"}</span>
              <ChevronsUpDownIcon aria-hidden />
            </button>
          </>
        )}
      </div>

      <div className="pg-topbar-center">
        <button type="button" className="pg-search-trigger" onClick={() => onOpenPalette({ type: "all" })}>
          <SearchIcon aria-hidden />
          <span>Search examples…</span>
          <kbd className="pg-kbd">⌘K</kbd>
        </button>
      </div>

      <div className="pg-topbar-end">
        {currentPath && (
          <div className="pg-segmented" role="group" aria-label="Canvas layout">
            {layouts.map((item) => (
              <button
                key={item.value}
                type="button"
                className="pg-segmented-item"
                aria-pressed={layout === item.value}
                aria-label={`${item.label} layout`}
                title={`${item.label} layout`}
                onClick={() => onLayoutChange(item.value)}
              >
                <item.icon aria-hidden />
              </button>
            ))}
          </div>
        )}

        {currentPath && (
          <button
            type="button"
            className="pg-btn"
            data-icon
            aria-label="Full screen"
            title="Full screen (⌘⇧F)"
            onClick={onFullscreen}
          >
            <Maximize2Icon aria-hidden />
          </button>
        )}

        {currentPath && (
          <div
            className="pg-segmented"
            role="group"
            aria-label="Inspector"
            aria-disabled={!hasInspector || undefined}
            title={hasInspector ? undefined : "This example has no inspector"}
          >
            {docks.map((item) => (
              <button
                key={item.value}
                type="button"
                className="pg-segmented-item"
                disabled={!hasInspector}
                aria-pressed={hasInspector && inspectorShown && dock === item.value}
                aria-label={`Inspector ${item.label.toLowerCase()}`}
                title={`Inspector ${item.label.toLowerCase()} (⌘. to toggle)`}
                onClick={() => onSelectDock(item.value)}
              >
                <item.icon aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

function ZagLogo() {
  return (
    <svg viewBox="0 0 377 133" fill="none" aria-hidden>
      <path d="M243.68 67.7895L310.68 13.0287L265.18 112L369.68 7" stroke="var(--green-brand)" strokeWidth="19" />
      <path
        d="M23.748 85.8405H62.052V102H1.67V86.705L39.043 46.7385L39.5085 47.47H0L9.18001 31.377H61.254V46.672L24.2135 86.5055L23.748 85.8405Z"
        fill="currentColor"
      />
      <path
        d="M92.9714 103.463C87.8287 103.463 83.2402 102.643 79.2059 101.003C75.2159 99.3622 72.0904 96.9903 69.8294 93.887C67.5684 90.7837 66.4379 87.0153 66.4379 82.582C66.4379 77.5723 67.8122 73.4937 70.5609 70.346C73.3095 67.1983 76.9449 64.8043 81.4669 63.164C86.0332 61.4793 90.9764 60.371 96.2964 59.839C104.055 59.0853 109.397 58.3982 112.323 57.7775C115.293 57.1568 116.778 56.0707 116.778 54.519C116.778 54.4747 116.778 54.4303 116.778 54.386C116.778 51.7703 115.515 49.7088 112.988 48.2015C110.505 46.6942 107.025 45.9405 102.547 45.9405C97.8037 45.9405 94.1684 46.805 91.6414 48.534C89.1587 50.2187 87.9174 52.8122 87.9174 56.3145H67.6349C67.6349 50.6398 69.1644 45.8518 72.2234 41.9505C75.3267 38.0492 79.5162 35.101 84.7919 33.106C90.0676 31.0667 96.0304 30.047 102.68 30.047C108.887 30.047 114.628 31.0002 119.904 32.9065C125.18 34.7685 129.413 37.5837 132.605 41.352C135.842 45.1203 137.46 49.9083 137.46 55.716C137.46 56.647 137.46 57.578 137.46 58.509C137.46 59.3957 137.46 60.3045 137.46 61.2355V86.2395C137.46 88.0572 137.504 89.8083 137.593 91.493C137.726 93.1333 137.992 94.6407 138.391 96.015C138.834 97.5667 139.388 98.8523 140.053 99.872C140.718 100.892 141.273 101.601 141.716 102H121.433C121.123 101.69 120.635 101.047 119.97 100.072C119.35 99.0962 118.818 97.9657 118.374 96.68C117.842 95.1283 117.443 93.5767 117.177 92.025C116.956 90.429 116.845 88.567 116.845 86.439L121.101 89.365C119.86 92.291 117.842 94.818 115.049 96.946C112.301 99.0297 109.02 100.648 105.207 101.8C101.439 102.909 97.3604 103.463 92.9714 103.463ZM98.4909 88.035C101.727 88.035 104.742 87.4587 107.535 86.306C110.372 85.109 112.678 83.247 114.451 80.72C116.224 78.193 117.111 74.8902 117.111 70.8115V63.696L122.231 68.6835C119.305 69.7475 115.914 70.6342 112.057 71.3435C108.244 72.0085 104.432 72.5405 100.619 72.9395C96.0969 73.3828 92.7054 74.1587 90.4444 75.267C88.2277 76.331 87.1194 78.1487 87.1194 80.72C87.1194 83.1583 88.0725 84.9982 89.9789 86.2395C91.8852 87.4365 94.7226 88.035 98.4909 88.035Z"
        fill="currentColor"
      />
      <path
        d="M197.966 93.621C202.31 94.0643 206.101 94.9067 209.337 96.148C212.618 97.345 215.167 99.1405 216.985 101.535C218.802 103.884 219.711 107.032 219.711 110.978C219.711 115.544 218.204 119.423 215.189 122.615C212.219 125.851 207.852 128.312 202.089 129.997C196.325 131.681 189.343 132.523 181.141 132.523C169.038 132.523 159.662 130.772 153.012 127.27C146.406 123.812 143.103 119.179 143.103 113.371C143.103 111.731 143.28 110.246 143.635 108.916C144.034 107.63 144.522 106.522 145.098 105.591L163.851 108.317C163.629 108.628 163.386 109.093 163.12 109.714C162.898 110.379 162.787 111.199 162.787 112.174C162.787 114.524 164.538 116.275 168.041 117.428C171.587 118.581 176.154 119.157 181.74 119.157C185.685 119.157 189.055 118.869 191.848 118.293C194.685 117.761 196.835 116.962 198.298 115.898C199.805 114.834 200.559 113.615 200.559 112.241C200.559 110.246 199.584 108.938 197.633 108.317C195.727 107.697 193.51 107.254 190.983 106.988L164.25 104.261C159.329 103.773 155.25 102.355 152.014 100.005C148.778 97.6553 147.16 94.4855 147.16 90.4955C147.16 88.0128 147.847 85.7518 149.221 83.7125C150.595 81.6288 152.169 79.922 153.943 78.592C155.716 77.2177 157.201 76.3532 158.398 75.9985L168.905 81.3185C168.063 81.4515 167.065 81.9835 165.913 82.9145C164.804 83.8455 164.25 84.9317 164.25 86.173C164.25 87.4143 164.871 88.4783 166.112 89.365C167.398 90.2517 169.725 90.8502 173.095 91.1605L197.966 93.621ZM204.948 31.377H223.103L215.721 58.509C214.347 63.6517 212.307 68.2402 209.603 72.2745C206.899 76.2645 203.286 79.4122 198.764 81.7175C194.286 84.0228 188.633 85.1755 181.806 85.1755C174.624 85.1755 168.395 84.0672 163.12 81.8505C157.888 79.6338 153.854 76.5083 151.017 72.474C148.179 68.3953 146.761 63.5852 146.761 58.0435C146.761 52.5018 148.201 47.6252 151.083 43.4135C154.009 39.2018 157.977 35.9212 162.987 33.5715C168.041 31.2218 173.76 30.047 180.144 30.047C184.976 30.047 189.387 30.845 193.377 32.441C197.411 33.9927 200.648 36.0542 203.086 38.6255C205.569 41.1968 206.854 44.0342 206.943 47.1375L203.153 48.135L204.948 31.377ZM181.673 70.08C184.599 70.08 187.17 69.6145 189.387 68.6835C191.604 67.7082 193.333 66.3117 194.574 64.494C195.815 62.632 196.436 60.3932 196.436 57.7775C196.436 55.2062 195.815 53.0117 194.574 51.194C193.333 49.3763 191.604 47.9798 189.387 47.0045C187.17 46.0292 184.599 45.5415 181.673 45.5415C178.88 45.5415 176.353 46.0513 174.092 47.071C171.875 48.0463 170.124 49.465 168.839 51.327C167.553 53.1447 166.91 55.3613 166.91 57.977C166.91 60.5483 167.531 62.7428 168.772 64.5605C170.013 66.3338 171.742 67.7082 173.959 68.6835C176.176 69.6145 178.747 70.08 181.673 70.08Z"
        fill="currentColor"
      />
    </svg>
  )
}
