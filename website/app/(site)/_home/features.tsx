import { cx } from "styled-system/css"
import { Arrow, Tile, type TileProps } from "./bento"
import {
  dialogButton,
  menu,
  menuHighlight,
  menuItem,
  menuKbd,
  menuLabel,
} from "./bento.css"
import * as f from "./features.css"
import { section, wrap } from "./home.css"

export { DeepSection } from "./deep-section"

function Glyph({ d }: { d: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const actions = [
  {
    label: "Rename",
    shortcut: "⌘R",
    icon: "M3 12.5V13h.5l7.8-7.8-.5-.5L3 12.5Z M10 4l2 2",
  },
  { label: "Duplicate", shortcut: "⌘D", icon: "M5 5h7v7H5z M3 10V3h7" },
  {
    label: "Archive",
    shortcut: "⌘E",
    icon: "M2.5 4h11v2.5h-11z M3.5 6.5V13h9V6.5 M6.5 9h3",
  },
  {
    label: "Delete",
    shortcut: "⌫",
    icon: "M3 4.5h10 M6 4.5V3h4v1.5 M4.5 4.5l.7 8.5h5.6l.7-8.5",
    danger: true,
  },
]

// Animates through the items unless a row is pinned with `selected`
function ActionMenu({
  compact,
  selected,
}: {
  compact?: boolean
  selected?: 1 | 2
}) {
  return (
    <div className={menu({ size: compact ? "compact" : "md" })}>
      <span
        className={menuHighlight({
          selected,
          animation: selected ? "none" : "cycle",
        })}
      />
      {actions.map((action) => (
        <span
          key={action.label}
          className={menuItem({ danger: action.danger })}
        >
          <Glyph d={action.icon} />
          <span className={menuLabel}>{action.label}</span>
          {!compact && <kbd className={menuKbd}>{action.shortcut}</kbd>}
        </span>
      ))}
    </div>
  )
}

function DirectionSwap({ down, up }: { down: string; up: string }) {
  return (
    <span className={f.direction}>
      <span className={f.directionDown}>{down}</span>
      <span className={f.directionUp}>{up}</span>
    </span>
  )
}

function KeyEvents() {
  return (
    <div className={f.keysScene}>
      <div className={f.keyStack}>
        <span className={f.keycap({ animation: "press" })}>
          <DirectionSwap down="↓" up="↑" />
        </span>
        <span className={f.eventChip}>
          <DirectionSwap down="ARROW_DOWN" up="ARROW_UP" />
        </span>
      </div>
      <Arrow width={56} />
      <ActionMenu />
    </div>
  )
}

const machineStates = ["closed", "opening", "open", "closing"]

function StateList() {
  return (
    <div className={f.states}>
      <span className={f.stateIndicator} />
      {machineStates.map((state) => (
        <span key={state} className={f.stateRow}>
          {state}
        </span>
      ))}
    </div>
  )
}

const frameworks = ["React", "Vue", "Svelte"]
const selectedFramework = "Svelte"
const parts = ["trigger", "content", "item"] as const

function Anatomy() {
  return (
    <div className={f.select}>
      <span className={f.selectLabel}>Framework</span>
      <span className={f.selectTrigger}>
        {selectedFramework}
        <Glyph d="M4.5 6.5 8 10l3.5-3.5" />
      </span>
      <div className={f.selectContent}>
        {frameworks.map((name) => {
          const selected = name === selectedFramework
          return (
            <span
              key={name}
              className={f.selectItem}
              data-selected={selected ? "" : undefined}
            >
              {name}
              {selected && <Glyph d="M3.5 8.5 6.5 11.5 12.5 4.5" />}
            </span>
          )
        })}
      </div>
      {parts.map((part) => (
        <span key={part} className={f.callout({ part })}>
          {part}
        </span>
      ))}
    </div>
  )
}

const typeaheadKeys = ["↑", "↓", "S"]

function Typeahead() {
  return (
    <div className={f.typeaheadScene}>
      <div className={f.typeaheadKeys}>
        {typeaheadKeys.map((key) => (
          <span
            key={key}
            className={f.keycap({
              size: "sm",
              animation: key === "S" ? "tap" : "none",
            })}
          >
            {key}
          </span>
        ))}
      </div>
      <div className={f.typeaheadMenu}>
        <span className={menuHighlight({ animation: "typeahead" })} />
        {["React", "Solid", "Svelte"].map((name) => (
          <span key={name} className={menuItem()}>
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function FocusTrap() {
  return (
    <div className={f.dialog}>
      <p className={f.dialogTitle}>Delete project?</p>
      <p className={f.dialogText}>This can't be undone.</p>
      <div className={f.dialogActions}>
        <span className={dialogButton()}>Cancel</span>
        <span className={dialogButton({ danger: true })}>Delete</span>
        <span className={f.focusRing} />
      </div>
    </div>
  )
}

function Announcement() {
  return (
    <div className={f.announceScene}>
      <ActionMenu compact selected={1} />
      <div className={f.voiceOver}>
        <svg
          className={f.voiceOverIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path d="M4 9v6h4l5 4V5L8 9H4Z" strokeLinejoin="round" />
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7 M19 6a8.5 8.5 0 0 1 0 12"
            strokeLinecap="round"
          />
        </svg>
        <span className={f.voiceOverText}>Duplicate, menu item, 2 of 4</span>
      </div>
    </div>
  )
}

const tiles: TileProps[] = [
  {
    span: 2,
    title: "Keys do the right thing",
    desc: "Every key press becomes an event the component handles for you. No tangled if-statements",
    art: <KeyEvents />,
  },
  {
    title: "No impossible states",
    desc: "Every component is a statechart, so it's only ever in one state at a time",
    art: <StateList />,
  },
  {
    title: "Anatomy",
    desc: "Each part has a clear role and its own props, wired with the right ARIA and events",
    art: <Anatomy />,
  },
  {
    title: "Keyboard",
    desc: "Carefully designed interactions, from arrow keys to typeahead, that also work in RTL",
    art: <Typeahead />,
  },
  {
    title: "Focus",
    desc: "Focus moves into menus and dialogs, then returns where it came from. Modals keep it inside",
    art: <FocusTrap />,
  },
  {
    span: 3,
    title: "Screen readers",
    desc: "Changes are announced as they happen, following the WAI-ARIA patterns. The same tests run in every framework",
    art: <Announcement />,
  },
]

export function FeaturesSection() {
  return (
    <section className={cx(wrap, section)} aria-label="How it works">
      <h2 className={f.heading}>The hard parts are already done</h2>
      <div className={f.grid}>
        {tiles.map((tile) => (
          <Tile key={tile.title} {...tile} />
        ))}
      </div>
    </section>
  )
}
