import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "components/icons"
import type { DiagramKey } from "components/illustrations/types"

export type { DiagramKey }

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
    title: "Accessible components for any framework",
    subtitle:
      "Over 50 components, from menus and dialogs to date pickers, with keyboard, focus and screen reader support built in. They work the same in React, Vue, Solid, Svelte and Preact, and you style them your way.",
    cta: "Get started",
    secondary: "Browse components",
  },
  cards: [
    { id: "00", label: "Why Zag", slug: "principles" },
    { id: "01", label: "States", slug: "machines" },
    { id: "02", label: "Clicks and keys", slug: "events" },
    { id: "03", label: "Parts", slug: "anatomy" },
    { id: "04", label: "Frameworks", slug: "adapters" },
    { id: "05", label: "Accessibility", slug: "a11y" },
    { id: "06", label: "Styling", slug: "styling" },
  ],
  chapters: [
    {
      id: "00",
      slug: "principles",
      title: "Why Zag exists",
      intro:
        "Menus, dialogs and comboboxes look simple until you try them with a keyboard or a screen reader. The Chakra UI team kept fixing the same focus and keyboard bugs, then fixed them again in the Vue version. Zag lets them write each fix once and use it everywhere.",
      sections: [
        {
          title: "Zag does the behavior, you do the look",
          lead: "How a component behaves is the hard part, so Zag keeps it in one place.",
          diagram: "principles",
          terms: [
            {
              term: "Behavior in one place",
              body: "Opening, closing, highlighting and selecting are written once, with no framework code in them.",
            },
            {
              term: "Works in any framework",
              body: "A small package for each framework connects that same behavior to React, Vue, Solid, Svelte or Preact.",
            },
            {
              term: "Your markup, your styles",
              body: "Zag gives you the attributes and event handlers for each element. You put them on your own HTML and style it however you like.",
            },
          ],
        },
      ],
    },
    {
      id: "01",
      slug: "machines",
      title: "Always in a known state",
      intro:
        "Every Zag component knows exactly what state it's in. A menu is closed, opening, open or closing, one at a time. Each state lists what can happen next, so the menu never ends up somewhere nobody planned. Zag calls this a state machine.",
      sections: [
        {
          title: "One state at a time",
          lead: "A closed menu waits for something to open it. An open menu listens for arrow keys, Escape and clicks.",
          diagram: "machines",
          caption: "A menu has six states. One is active at a time.",
          terms: [
            {
              term: "No half-open menus",
              body: "A menu is never open and closed at the same time, so the bugs that come from mixed-up flags don't happen.",
            },
            {
              term: "Read it top to bottom",
              body: "Each component's logic sits in one file, state by state. You follow it in order instead of chasing effects across hooks.",
            },
          ],
        },
        {
          title: "Let Zag track it, or track it yourself",
          lead: "Zag remembers whether the menu is open, and you can take over that value when your app needs it.",
          diagram: "machines",
          caption: "Zag owns the value, or you do",
          terms: [
            {
              term: "Zag keeps track",
              body: "Set a starting value with defaultOpen and the menu handles the rest.",
            },
            {
              term: "You keep track",
              body: "Pass open and listen to onOpenChange. The menu follows your value.",
            },
          ],
        },
      ],
    },
    {
      id: "02",
      slug: "events",
      title: "The state decides what a key does",
      intro:
        "Zag turns clicks, key presses and pointer moves into named events, like a click on the trigger. The component's current state decides what each event does, so you don't write an if-statement for every case.",
      sections: [
        {
          title: "One key, two jobs",
          lead: "Press ArrowDown on a closed menu and it opens. Press it in an open menu and the highlight moves down.",
          diagram: "events",
          caption: "ArrowDown in an open menu moves the highlight",
          terms: [
            {
              term: "Handlers come built in",
              body: "Zag adds the click and key handlers to each element for you. To open it from your own code, call api.setOpen(true).",
            },
            {
              term: "It waits for you when it should",
              body: "If you control the open state, a click calls onOpenChange and the menu waits for your new value.",
            },
          ],
        },
      ],
    },
    {
      id: "03",
      slug: "anatomy",
      title: "A component is a set of parts",
      intro:
        "A menu is more than one element. There's the button that opens it, the list, and each item in the list. Zag names each part and gives it what it needs: the right role, ARIA attributes and event handlers.",
      sections: [
        {
          title: "One call per element",
          lead: "You spread getTriggerProps() on your button and it's ready.",
          diagram: "anatomy",
          caption: "The button, the list and each item get their own props",
          terms: [
            {
              term: "Trigger, content, item",
              body: "These are the menu's parts. Other components have their own, like a dialog's backdrop or a slider's thumb.",
            },
            {
              term: "Everything the element needs",
              body: "Each call returns the role, ARIA attributes, event handlers and data attributes for that part, based on the current state.",
            },
          ],
        },
      ],
    },
    {
      id: "04",
      slug: "adapters",
      title: "Works in any framework",
      intro:
        "The component logic doesn't depend on a framework. A small package for React, Preact, Solid, Vue, Svelte or plain JavaScript connects it to your app. Every package ships at the same version, so a combobox behaves the same in your React app and your Vue app.",
      sections: [
        {
          title: "The same two steps everywhere",
          lead: "In every framework you start the component, then ask it for props.",
          diagram: "adapters",
          caption: "Start it, get props, render",
          terms: [
            {
              term: "Start the component",
              body: "useMachine() starts it when your component mounts and stops it when it unmounts.",
            },
            {
              term: "Props in your framework's format",
              body: "Zag writes each prop the way your framework expects, so React gets htmlFor and Vue gets for.",
            },
          ],
        },
      ],
    },
    {
      id: "05",
      slug: "a11y",
      title: "Accessible from the start",
      intro:
        "Keyboard support, focus and screen reader labels follow the WAI-ARIA authoring practices, the W3C guide to accessible widgets. Edge cases you'd usually find on your third rewrite are already handled, and Playwright tests check them in each framework.",
      sections: [
        {
          title: "Keyboard support",
          lead: "Arrow keys, Home, End and typing a letter all work before you write a handler.",
          diagram: "a11y",
          caption: "Screen readers read each item as the highlight moves",
          terms: [
            {
              term: "Screen readers keep up",
              body: "Focus stays on the menu while the highlight moves, and screen readers announce each item.",
            },
            {
              term: "Type to jump",
              body: "Type the first letters of an item to jump to it.",
            },
            {
              term: "Right-to-left languages",
              body: "Set dir to rtl and the left and right arrow keys swap.",
            },
          ],
        },
        {
          title: "Focus goes where you expect",
          lead: "Focus moves into what opens and back to what opened it.",
          diagram: "a11y",
          caption: "Focus moves into the dialog, then back to the button",
          terms: [
            {
              term: "Escape closes one thing",
              body: "Escape closes the topmost layer only. A menu open inside a dialog closes before the dialog does.",
            },
            {
              term: "Focus goes back where it was",
              body: "When a dialog closes, focus returns to the button that opened it.",
            },
            {
              term: "Focus stays inside",
              body: "While a modal dialog is open, Tab stays inside it. The page behind can't scroll, and screen readers skip over it.",
            },
          ],
        },
      ],
    },
    {
      id: "06",
      slug: "styling",
      title: "Style it your way",
      intro:
        "Zag ships zero CSS. Each part carries attributes that say what it is and what state it's in, so you can style it with plain CSS, Tailwind or your own design tokens.",
      sections: [
        {
          title: "Style by name and state",
          lead: "Pick a part by its name, then style each state.",
          diagram: "styling",
          caption: "[data-menu-content][data-state=open]",
          terms: [
            {
              term: "Every part has a name",
              body: "The menu's list gets data-menu-content and each item gets data-menu-item. Target them from any stylesheet.",
            },
            {
              term: "Every state is visible",
              body: "data-state says open or closed. Hook enter and exit animations to it.",
            },
            {
              term: "Highlighted and disabled items",
              body: "The item under the keyboard or pointer gets data-highlighted. Items that can't be picked get data-disabled.",
            },
          ],
        },
      ],
    },
  ],
  closing: {
    title: "Start with one component",
    body: "Install a component and the package for your framework. Bring your own markup and styles.",
    cta: "Get started",
  },
}

export interface HTerm extends GuideTerm {
  key: string
}

export interface HSection extends Omit<GuideSection, "terms"> {
  id: string
  terms: HTerm[]
}

export interface HChapter extends Omit<GuideChapter, "sections"> {
  state: string
  label: string
  sections: HSection[]
}

const sectionIds: Record<string, string[]> = {
  principles: ["ideas"],
  machines: ["states", "controlled"],
  events: ["send"],
  anatomy: ["parts"],
  adapters: ["frameworks"],
  a11y: ["keyboard", "focus"],
  styling: ["attributes"],
}

const keys: Record<string, string> = {
  "Logic lives in a machine": "logicLivesInAMachine",
  "Frameworks are adapters": "frameworksAreAdapters",
  "You own the markup": "youOwnTheMarkup",
  "Prop getters": "propGetters",
  "Dismissable layer": "dismissableLayer",
  "CSS variables": "cssVariables",
}

function toKey(term: string) {
  const key = keys[term] ?? term
  return /^[A-Za-z_$][\w$.]*(\(\))?$/.test(key) ? key : JSON.stringify(key)
}

const labels = new Map(guide.cards.map((c) => [c.slug, c.label]))

export const chapters: HChapter[] = guide.chapters.map((chapter) => ({
  ...chapter,
  state: chapter.slug,
  label: labels.get(chapter.slug) ?? chapter.title,
  sections: chapter.sections.map((section, i) => ({
    ...section,
    id: `${chapter.slug}.${sectionIds[chapter.slug]?.[i] ?? i + 1}`,
    terms: section.terms.map((t) => ({ ...t, key: toKey(t.term) })),
  })),
}))

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
    state: "done",
    title: guide.closing.title,
    body: guide.closing.body,
  },
}

export const frameworks = [
  { id: "react", label: "React", icon: ReactIcon },
  { id: "vue", label: "Vue", icon: VueIcon },
  { id: "solid", label: "Solid", icon: SolidIcon },
  { id: "svelte", label: "Svelte", icon: SvelteIcon },
] as const

export const installCommands = [
  { id: "pnpm", cmd: "pnpm add @zag-js/react @zag-js/menu" },
  { id: "npm", cmd: "npm i @zag-js/react @zag-js/menu" },
  { id: "yarn", cmd: "yarn add @zag-js/react @zag-js/menu" },
  { id: "bun", cmd: "bun add @zag-js/react @zag-js/menu" },
]

export const tour = [
  { index: "01", state: "states", label: "States", mini: "machines" },
  { index: "02", state: "events", label: "Clicks and keys", mini: "events" },
  { index: "03", state: "parts", label: "Parts", mini: "anatomy" },
  { index: "04", state: "a11y", label: "Accessibility", mini: "a11y" },
  { index: "05", state: "styling", label: "Styling", mini: "styling" },
] as const
