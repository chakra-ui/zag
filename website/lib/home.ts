import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "components/icons"

export const hCopy = {
  hero: {
    badge: "v2 is in pre-release. Read what changed →",
    title: "Accessible components",
    accent: "for any framework",
    subtitle:
      "50+ components that already handle the keyboard, focus and screen readers. You write the markup and the CSS.",
    tour: "Read them in order, or jump to the one you need.",
  },
  contents: "How it works",
  start: {
    state: "install",
    label: "Get started",
    body: "Install one component and try it.",
    href: "/overview/introduction",
  },
  glossary: "connect(service)",
  closing: {
    title: "Start with one component",
    accent: "in the framework you already use",
  },
}

export const frameworks = [
  { id: "react", label: "React", icon: ReactIcon },
  { id: "vue", label: "Vue", icon: VueIcon },
  { id: "solid", label: "Solid", icon: SolidIcon },
  { id: "svelte", label: "Svelte", icon: SvelteIcon },
] as const

export const tour = [
  { index: "01", state: "states", label: "States", mini: "machines" },
  { index: "02", state: "events", label: "Clicks and keys", mini: "events" },
  { index: "03", state: "parts", label: "Parts", mini: "anatomy" },
  { index: "04", state: "a11y", label: "Accessibility", mini: "a11y" },
  { index: "05", state: "styling", label: "Styling", mini: "styling" },
] as const

export const chapterCopy = {
  states: {
    title: "One state at a time",
    accent: "never half-open",
    lead: "A menu is closed, opening, open or closing, and only ever one of those. Each state lists the events it accepts, so the menu can't end up somewhere nobody wrote down.",
    terms: [
      {
        term: "No stray booleans",
        body: "isOpen and isClosing can't disagree, because they don't exist.",
      },
      {
        term: "One file to read",
        body: "The whole menu fits in one machine you can read top to bottom.",
      },
    ],
    steps: [
      { state: "closed", event: "OPEN" },
      { state: "opening", event: "ANIMATION.END" },
      { state: "open", event: "CLOSE", active: true },
      { state: "closing" },
    ],
  },
  events: {
    title: "The state decides what a key does",
    accent: "and you skip the if-statements",
    lead: "Every click and key press becomes a named event. What it does depends on the state the menu is in, and the handlers are already attached.",
    rows: [
      {
        state: "closed",
        key: "↓",
        result: "Opens and highlights the first item",
      },
      {
        state: "open",
        key: "↓",
        result: "Moves the highlight down",
        active: true,
      },
      {
        state: "open",
        key: "esc",
        result: "Closes, focus goes back to the button",
        active: true,
      },
      {
        state: "controlled",
        key: "click",
        result: "Calls onOpenChange and waits for you",
      },
    ],
  },
  parts: {
    title: "A component is a set of parts",
    accent: "one call per element",
    lead: "A menu has a trigger, a content panel and items. Spread getTriggerProps() on your button and it gets its ARIA attributes and handlers, kept in sync with the state.",
    getters: [
      {
        call: "getTriggerProps()",
        returns: "aria-haspopup, aria-expanded, aria-controls, onClick",
      },
      {
        call: "getContentProps()",
        returns: 'role="menu", aria-activedescendant, data-state',
      },
      {
        call: "getItemProps({ value })",
        returns: 'role="menuitem", data-highlighted, data-disabled',
      },
    ],
    code: "<button {...api.getTriggerProps()}>\n  Actions\n</button>",
  },
  a11y: {
    title: "Accessible before you write a handler",
    accent: "and tested in every framework",
    lead: "Each component follows the WAI-ARIA Authoring Practices. The same Playwright suite runs against the React, Vue, Solid and Svelte versions.",
    cards: [
      {
        title: "Keyboard",
        body: "Arrow keys, Home, End, and typing a letter to jump. In right-to-left layouts the arrows flip.",
      },
      {
        title: "Focus",
        body: "Focus moves into what opens and back to what opened it. Modals keep it inside.",
      },
      {
        title: "Screen readers",
        body: "The highlighted item is announced as it changes. Escape closes the top layer and nothing under it.",
      },
    ],
  },
}

export const stylingCopy = {
  title: "Zag ships zero CSS.",
  accent: "Bring your own styles.",
  lead: "Every part says what it is and what state it's in. Pick a component, pick your styling tool, and target those attributes.",
}

export const deepCopy = {
  title: "Go as deep",
  accent: "as you need.",
  lead: "Most apps only spread the props. When you need more, every layer underneath is yours to use: the machine's events, its methods, and the same createMachine we build our own components with.",
  levels: [
    {
      level: 1,
      tag: "styles",
      title: "Write a style once",
      body: "Menu, select and combobox items share the same states, so one rule covers all three.",
      language: "css",
      code: `/* one highlight for every list */
[data-menu-item][data-highlighted],
[data-select-item][data-highlighted],
[data-combobox-item][data-highlighted] {
  background: var(--green-50);
}`,
      highlight: [],
    },
    {
      level: 2,
      tag: "composition",
      title: "Wire components together",
      body: "Machines talk through callbacks and methods. Here a menu item opens a confirm dialog.",
      language: "tsx",
      code: `const confirm = dialog.connect(dialogService, normalizeProps)

const service = useMachine(menu.machine, {
  id: "actions",
  onSelect({ value }) {
    if (value === "delete") confirm.setOpen(true)
  },
})`,
      highlight: [6],
    },
    {
      level: 3,
      tag: "control",
      title: "Drive it from your code",
      body: "Own the open state, or call the same methods the keyboard does.",
      language: "tsx",
      code: `const service = useMachine(menu.machine, {
  id: "actions",
  open,
  onOpenChange: (details) => setOpen(details.open),
})

api.setHighlightedValue("rename")`,
      highlight: [],
    },
    {
      level: 4,
      tag: "machines",
      title: "Write your own machine",
      body: "Every Zag component is built with @zag-js/core. Use it for the ones we don't ship.",
      language: "tsx",
      code: `export const machine = createMachine<ToggleSchema>({
  initialState() {
    return "off"
  },
  states: {
    off: { on: { CLICK: { target: "on" } } },
    on: { on: { CLICK: { target: "off" } } },
  },
})`,
      highlight: [],
    },
  ],
  more: {
    label: "Read the guides →",
    href: "/guides/composition",
    body: "Composition, programmatic control, building machines",
  },
} as const
