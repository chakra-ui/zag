export type DiagramKey =
  | "principles"
  | "machines"
  | "events"
  | "anatomy"
  | "adapters"
  | "a11y"
  | "styling"

export interface GuideTerm {
  term: string
  body: string
}

export interface GuideSection {
  title: string
  lead: string
  diagram: DiagramKey
  caption?: string
  terms: GuideTerm[]
}

export interface GuideChapter {
  id: string
  slug: string
  title: string
  intro: string
  sections: GuideSection[]
}

export interface GuideCopy {
  hero: {
    kicker: string
    title: string
    subtitle: string
    cta: string
    secondary: string
  }
  cards: { id: string; label: string; slug: string }[]
  chapters: GuideChapter[]
  closing: { title: string; body: string; cta: string }
}

export const guide: GuideCopy = {
  hero: {
    kicker: "Zag · a field guide",
    title: "Build the menu once",
    subtitle:
      "Zag puts menus, dialogs and comboboxes in state machines, so focus, keyboard and ARIA work the same in every framework.",
    cta: "Get started",
    secondary: "Browse components",
  },
  cards: [
    { id: "00", label: "Principles", slug: "principles" },
    { id: "01", label: "Machines", slug: "machines" },
    { id: "02", label: "Events", slug: "events" },
    { id: "03", label: "Anatomy", slug: "anatomy" },
    { id: "04", label: "Adapters", slug: "adapters" },
    { id: "05", label: "Accessibility", slug: "a11y" },
    { id: "06", label: "Styling", slug: "styling" },
  ],
  chapters: [
    {
      id: "00",
      slug: "principles",
      title: "Core principles",
      intro:
        "Three ideas run through everything that follows. Each one comes from a bug we fixed too many times, once per framework.",
      sections: [
        {
          title: "Three ideas",
          lead: "Behavior is the hard part. Write it once and keep it out of your components.",
          diagram: "principles",
          terms: [
            {
              term: "Logic lives in a machine",
              body: "Open, close, highlight and select are states and transitions, not a pile of effects and flags. You can read the whole component in one file.",
            },
            {
              term: "Frameworks are adapters",
              body: "The machine never imports React, Vue or Svelte. A thin adapter wires it to each framework's reactivity.",
            },
            {
              term: "You own the markup",
              body: "Zag ships no styles and no components. It hands you props to spread on your own elements.",
            },
          ],
        },
      ],
    },
    {
      id: "01",
      slug: "machines",
      title: "Machines",
      intro:
        "Every component is a finite state machine. A menu is idle, open or closed, never half of each. Impossible states stay impossible because there is no transition into them.",
      sections: [
        {
          title: "States, not flags",
          lead: "One state at a time, and a list of the events each state accepts.",
          diagram: "machines",
          caption: "menu.machine · 6 states",
          terms: [
            {
              term: "createMachine()",
              body: "Declares states, transitions, guards, actions and effects in one object. It runs the same in every framework.",
            },
            {
              term: "state.matches()",
              body: "Asks which state the machine is in. Nested states use dot paths like open.idle.",
            },
            {
              term: "effects",
              body: "Work that runs while a state is active, like tracking outside clicks. Zag cleans it up when the state exits.",
            },
          ],
        },
        {
          title: "Controlled or not",
          lead: "Each value can be owned by the machine or by you, without a second code path.",
          diagram: "machines",
          caption: "open · defaultOpen · onOpenChange",
          terms: [
            {
              term: "bindable",
              body: "Wraps a context value with a default, an optional controlled value and a change callback. Pass value and the machine follows it.",
            },
            {
              term: "computed",
              body: "Values derived from context and props. They're lazy and memoized by each framework.",
            },
            {
              term: "watch",
              body: "Tracks props or context and runs actions when they change, like syncing a disabled prop.",
            },
          ],
        },
      ],
    },
    {
      id: "02",
      slug: "events",
      title: "Events",
      intro:
        "Nothing changes until an event arrives. Clicks, keys and pointer moves become named events, and the current state decides what they mean.",
      sections: [
        {
          title: "Send, then transition",
          lead: "The same ArrowDown opens a closed menu and moves the highlight in an open one.",
          diagram: "events",
          caption: "TRIGGER_CLICK → open",
          terms: [
            {
              term: "send()",
              body: "Dispatches an event to the machine. DOM handlers call it for you, and you can call it yourself.",
            },
            {
              term: "guards",
              body: "Conditions on a transition. A guard like isOpenControlled stops the menu from opening itself when you own the open state.",
            },
            {
              term: "actions",
              body: "Side effects that run on a transition, like moving the highlight or invoking onSelect.",
            },
          ],
        },
      ],
    },
    {
      id: "03",
      slug: "anatomy",
      title: "Anatomy",
      intro:
        "A component is a set of named parts: trigger, positioner, content, item. connect() turns machine state into props for each one.",
      sections: [
        {
          title: "Props for every part",
          lead: "Spread a getter on your element and it gets the right role, ARIA, handlers and data attributes.",
          diagram: "anatomy",
          caption: "api.getTriggerProps() · api.getItemProps()",
          terms: [
            {
              term: "connect()",
              body: "Reads the service and returns an api object: state like api.open, methods like api.setOpen, and a prop getter per part.",
            },
            {
              term: "Prop getters",
              body: "getTriggerProps(), getContentProps(), getItemProps({ value }). Call them in render and spread the result.",
            },
            {
              term: "anatomy",
              body: "The list of parts a component exports. Use it to build styled wrappers that cover every part.",
            },
          ],
        },
      ],
    },
    {
      id: "04",
      slug: "adapters",
      title: "Adapters",
      intro:
        "Official adapters cover React, Preact, Solid, Vue, Svelte and vanilla JS. Machines and adapters share one version, so the combobox your React app ships is the one your Vue app ships.",
      sections: [
        {
          title: "Same machine, any framework",
          lead: "Two calls per component, whatever you render with.",
          diagram: "adapters",
          caption: "useMachine → connect → props",
          terms: [
            {
              term: "useMachine()",
              body: "Starts the machine, binds it to your framework's state and stops it on unmount. It returns the service.",
            },
            {
              term: "normalizeProps",
              body: "Converts Zag's prop shape to your framework's, so onClick and htmlFor come out right in Vue or Solid.",
            },
            {
              term: "mergeProps()",
              body: "Combines your props with Zag's. Event handlers chain and class names join instead of overwriting each other.",
            },
          ],
        },
      ],
    },
    {
      id: "05",
      slug: "a11y",
      title: "Accessibility",
      intro:
        "The details you'd find on the third rebuild are already in the machine. Keyboard, focus and ARIA follow the WAI-ARIA patterns, and are tested end to end.",
      sections: [
        {
          title: "Keyboard and ARIA",
          lead: "Arrow keys, Home, End and typing a letter all work before you write a handler.",
          diagram: "a11y",
          caption: "role=menu · aria-activedescendant",
          terms: [
            {
              term: "aria-activedescendant",
              body: "Focus stays on the menu while the highlight moves, and screen readers announce each item.",
            },
            {
              term: "typeahead",
              body: "Type the first letters of an item to jump to it. Keystrokes in quick succession build one search.",
            },
            {
              term: "dir",
              body: "Set dir to rtl and left and right arrows swap, and submenus open to the left.",
            },
          ],
        },
        {
          title: "Focus that lands right",
          lead: "Open, dismiss, close: focus goes where the user expects.",
          diagram: "a11y",
          caption: "dialog · trapFocus · restoreFocus",
          terms: [
            {
              term: "Dismissable layer",
              body: "Escape and outside clicks close the top layer only, so a menu inside a dialog closes first.",
            },
            {
              term: "restoreFocus",
              body: "When a dialog closes, focus returns to the element that opened it.",
            },
            {
              term: "trapFocus",
              body: "A modal dialog keeps Tab inside, locks page scroll and hides the rest of the page from screen readers.",
            },
          ],
        },
      ],
    },
    {
      id: "06",
      slug: "styling",
      title: "Styling",
      intro:
        "Zag renders no styles. Every part carries data attributes for what it is and what state it's in, so plain CSS, Tailwind or your token system can target it.",
      sections: [
        {
          title: "Style the state",
          lead: "Select a part by name and a state by attribute.",
          diagram: "styling",
          caption: "[data-menu-content][data-state=open]",
          terms: [
            {
              term: "data-{scope}-{part}",
              body: "Each part gets one attribute, like data-menu-item or data-dialog-backdrop. Its value is the machine id.",
            },
            {
              term: "data-state",
              body: "open or closed, checked or unchecked. Hook enter and exit animations to it.",
            },
            {
              term: "data-highlighted",
              body: "Marks the item under the keyboard or pointer. Items also get data-disabled when they can't be picked.",
            },
            {
              term: "CSS variables",
              body: "Positioned parts expose --reference-width, --available-height and --transform-origin for sizing and motion.",
            },
          ],
        },
      ],
    },
  ],
  closing: {
    title: "Stop rebuilding the combobox",
    body: "Install one machine and one adapter. Bring your own markup and styles.",
    cta: "Get started",
  },
}
