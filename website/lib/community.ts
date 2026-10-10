import type { ShowcaseItem } from "lib/showcase"

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

/** Same shape as a showcase entry, plus who made it. `image` lives in `public/community/` */
export interface CommunityProject extends ShowcaseItem {
  /** GitHub username */
  author: string
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

export const communityProjects: CommunityProject[] = [
  {
    name: "zag-ripple",
    description: "Component library for Ripple JS through ZagJS",
    href: "https://github.com/anubra266/zag-ripple",
    image: "/community/zag-ripple.png",
    author: "anubra266",
  },
  {
    name: "zagjs-lit",
    description: "Lit framework adapter for Zag state machines.",
    href: "https://github.com/RampantDespair/ZagJs-Lit",
    image: "/community/zagjs-lit.png",
    author: "RampantDespair",
  },
  {
    name: "zag-angular",
    description: "An Angular wrapper for zag",
    href: "https://github.com/makuko/zag-angular",
    image: "/community/zag-angular.png",
    author: "makuko",
  },
]
