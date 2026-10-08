export interface CommunityLink {
  title: string
  description: string
  href: string
}

export interface TeamMember {
  name: string
  role: string
  href?: string
  avatar?: string
  links?: Array<{ label: string; href: string }>
}

export interface Recording {
  title: string
  description: string
  href: string
  image?: string
  duration?: string
}

export type CommunityProjectKind = "adapter" | "package" | "tool"

export type CommunityProjectStatus =
  "stable" | "beta" | "experimental" | "unmaintained"

export interface CommunityProject {
  name: string
  description: string
  kind: CommunityProjectKind
  /** Where the row links to: docs, homepage or repo */
  href: string
  author: { name: string; github?: string }
  /** Adapters only: the framework it targets */
  framework?: string
  /** Which major version of Zag it targets */
  zag?: "v1" | "v2"
  status?: CommunityProjectStatus
  /**
   * A single logo, or one per theme. Lives in `public/community/`, never
   * hotlinked. Without one, the tile shows the name's initials.
   */
  logo?: string | { light: string; dark: string }
  /** Brand color for the logo tile. Text color is picked for contrast */
  brand?: string
}

export const communityLinks: CommunityLink[] = [
  {
    title: "Discord",
    description:
      "Ask questions, share what you're building, and chat with maintainers.",
    href: "https://zagjs.com/discord",
  },
  {
    title: "GitHub Discussions",
    description:
      "Long-form community Q&A, ideas, and architecture conversations.",
    href: "https://github.com/chakra-ui/zag/discussions",
  },
  {
    title: "X (Twitter)",
    description:
      "Release updates, community highlights, and ecosystem announcements.",
    href: "https://twitter.com/zag_js",
  },
  {
    title: "YouTube",
    description: "Recordings, talks, and walkthroughs related to Zag.js.",
    href: "https://www.youtube.com/results?search_query=zag.js",
  },
]

export const teamMembers: TeamMember[] = [
  {
    name: "Segun Adebayo",
    role: "Creator & Lead Maintainer",
    avatar: "https://github.com/segunadebayo.png",
    links: [
      { label: "GitHub", href: "https://github.com/segunadebayo" },
      { label: "X", href: "https://x.com/thesegunadebayo" },
    ],
  },
  {
    name: "Adebesin Tolulope",
    role: "Maintainer",
    avatar: "https://github.com/Adebesin-Cell.png",
    links: [
      { label: "GitHub", href: "https://github.com/Adebesin-Cell" },
      { label: "X", href: "https://x.com/I_am_Lope" },
    ],
  },
  {
    name: "Esther",
    role: "Developer Relations",
    avatar: "https://github.com/estheragbaje.png",
    links: [
      { label: "GitHub", href: "https://github.com/estheragbaje" },
      { label: "X", href: "https://x.com/_estheradebayo" },
    ],
  },
]

export const advisorMembers: TeamMember[] = [
  {
    name: "Abraham",
    role: "Creator, Tark UI",
    avatar: "https://github.com/anubra266.png",
    links: [{ label: "GitHub", href: "https://github.com/anubra266" }],
  },
  {
    name: "Christian Schroter",
    role: "Creator, Park UI",
    avatar: "https://github.com/cschroeter.png",
    links: [{ label: "GitHub", href: "https://github.com/cschroeter" }],
  },
  {
    name: "Ivica Batinic",
    role: "Advisor",
    avatar: "https://github.com/isBatak.png",
    links: [{ label: "GitHub", href: "https://github.com/isBatak" }],
  },
]

export const alumniMembers: TeamMember[] = [
  {
    name: "Michal Korczak",
    role: "Past contributor",
    links: [{ label: "GitHub", href: "https://github.com/Omikorin" }],
  },
  {
    name: "Nelson Lai",
    role: "Past contributor",
    avatar: "https://github.com/nelsonlaidev.png",
    links: [{ label: "GitHub", href: "https://github.com/nelsonlaidev" }],
  },
]

export const recordings: Recording[] = [
  {
    title:
      "How Corex UI Uses Zag.js to Build Accessible, Interactive Components",
    description:
      "Sage chats with Karim, creator of Corex UI, about using Zag.js state machines to power accessible, interactive, and reusable UI components.",
    href: "https://www.youtube.com/watch?v=D1To2_5o8e8",
    duration: "35:06",
  },
  {
    title: "Skeleton + Zag.js: Building Cross-Framework Components",
    description:
      "Segun Adebayo sits down with Chris Simmons (Skeleton maintainer) to explore how Skeleton uses Zag.js to power its component architecture.",
    href: "https://www.youtube.com/watch?v=SLPBmP588Hk",
    duration: "50:28",
  },
  {
    title: "State machines in Zag.js w/ Segun Adebayo",
    description:
      "Segun Adebayo, creator of Chakra UI and Zag.js, discusses building accessible components with state machines.",
    href: "https://www.youtube.com/watch?v=2N4pSQqGT48",
    duration: "35:49",
  },
  {
    title:
      "Accessible Components with State Machines and Zag (with Segun Adebayo)",
    description:
      "A conversation on building accessible component patterns with Zag.js and finite state machines for design systems.",
    href: "https://www.youtube.com/watch?v=WF_PVXPL8qA",
    duration: "1:09:24",
  },
  {
    title: "The Future of Chakra UI (feat. Zag.js)",
    description:
      "Lee Robinson and Segun discuss the evolution of Chakra and Zag.",
    href: "https://www.youtube.com/watch?v=I5xEc9t-HZg",
    image: "/lee-rob-interview.png",
    duration: "56:48",
  },
]

export const communityProjects: CommunityProject[] = []

/**
 * Placeholder entries, one per tile variant and edge case. Shown only outside
 * production while `communityProjects` is empty, so the section can be reviewed.
 */
export const sampleCommunityProjects: CommunityProject[] = [
  {
    name: "zag-lit",
    kind: "adapter",
    framework: "Lit",
    zag: "v2",
    status: "beta",
    description:
      "Lit adapter for Zag machines, with reactive controllers for each machine.",
    href: "https://github.com/chakra-ui/zag/pull/2698",
    author: { name: "sample-author" },
    logo: {
      light: "/community/samples/mark-light.svg",
      dark: "/community/samples/mark-dark.svg",
    },
  },
  {
    name: "alpine-zag",
    kind: "adapter",
    framework: "Alpine.js",
    zag: "v2",
    status: "experimental",
    description:
      "Connects Zag machines to Alpine through a plugin and x-bind spreads.",
    href: "https://github.com/chakra-ui/zag/pull/2870",
    author: { name: "sample-author" },
    brand: "#2d3441",
    logo: "/community/samples/mark-brand.svg",
  },
  {
    name: "juris-zag",
    kind: "adapter",
    framework: "Juris",
    zag: "v2",
    description: "Wrappers to consume Zag machines in Juris apps.",
    href: "https://jurisjs.com",
    author: { name: "sample-author" },
  },
  {
    name: "zag-angular-signals-adapter-for-standalone-components",
    kind: "adapter",
    framework: "Angular",
    zag: "v1",
    status: "stable",
    description:
      "Angular integration built on signals, with directives for every part, a provider for machine services, SSR-safe ids, and a schematic that scaffolds a component from any machine.",
    href: "https://angular.dev",
    author: { name: "a-very-long-github-username-here" },
  },
  {
    name: "zag-ripple",
    kind: "package",
    status: "stable",
    description: "",
    href: "https://github.com/chakra-ui/zag",
    author: { name: "sample-author" },
  },
  {
    name: "zag-devtools",
    kind: "tool",
    status: "unmaintained",
    description:
      "Browser extension that visualizes machine state and transitions.",
    href: "https://github.com/chakra-ui/zag",
    author: { name: "sample-author" },
    brand: "#f6d84a",
  },
  {
    name: "zag-qwik",
    kind: "adapter",
    framework: "Qwik",
    zag: "v2",
    status: "experimental",
    description: "Qwik bindings for Zag machines with resumable state.",
    href: "https://qwik.dev",
    author: { name: "sample-author", github: "chakra-ui" },
  },
  {
    name: "zag-stencil",
    kind: "adapter",
    framework: "Stencil",
    zag: "v1",
    description: "Web components for Zag machines, built with Stencil.",
    href: "https://stenciljs.com",
    author: { name: "sample-author" },
  },
  {
    name: "zag-motion",
    kind: "package",
    status: "beta",
    description:
      "Presence and layout animations wired to machine state changes.",
    href: "https://github.com/chakra-ui/zag",
    author: { name: "sample-author" },
    brand: "#6d28d9",
  },
  {
    name: "zag-inspector",
    kind: "tool",
    description: "A VS Code extension that previews machine states inline.",
    href: "https://github.com/chakra-ui/zag",
    author: { name: "sample-author" },
  },
]
