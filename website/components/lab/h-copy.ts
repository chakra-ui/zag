import {
  guide,
  type DiagramKey,
  type GuideChapter,
  type GuideSection,
  type GuideTerm,
} from "./guide-copy"

export type { DiagramKey }

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
    kicker: "How Zag works",
    title: "Write the combobox once",
    subtitle:
      "Zag keeps a combobox's focus, keyboard and ARIA logic in one state machine. React, Vue, Solid, Svelte and Preact run the same machine, and you write the markup.",
    tour: "Seven short chapters, from the machine to your CSS.",
  },
  contents: "The tour",
  start: {
    state: "install",
    label: "Get started",
    body: "One machine, one adapter.",
    href: "/overview/introduction",
  },
  glossary: "connect(service)",
  closing: {
    state: "done",
    title: guide.closing.title,
    body: guide.closing.body,
  },
}
