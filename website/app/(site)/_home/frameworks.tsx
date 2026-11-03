import { ReactIcon, SolidIcon, SvelteIcon, VueIcon } from "components/icons"
import {
  PreactLogo,
  ReactLogo,
  SolidLogo,
  SvelteLogo,
  VueLogo,
} from "./framework-logos"

function PreactIcon(props: { width?: number; height?: number }) {
  return (
    <svg
      width={props.width ?? 20}
      height={props.height ?? 20}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 3.5 L34.3 11.75 V28.25 L20 36.5 L5.7 28.25 V11.75 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="11"
        ry="4.6"
        transform="rotate(-38 20 20)"
        stroke="#41B883"
        strokeWidth="1.8"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="11"
        ry="4.6"
        transform="rotate(38 20 20)"
        stroke="#41B883"
        strokeWidth="1.8"
      />
      <circle cx="20" cy="20" r="2.4" fill="#41B883" />
    </svg>
  )
}

export const frameworks = [
  {
    name: "React",
    pkg: "react",
    api: "menu.connect(service, normalizeProps)",
    spread: (p: string) => `{...api.${p}}`,
    Icon: ReactIcon,
    Logo: ReactLogo,
  },
  {
    name: "Vue",
    pkg: "vue",
    api: "computed(() => menu.connect(service, normalizeProps))",
    spread: (p: string) => `v-bind="api.${p}"`,
    Icon: VueIcon,
    Logo: VueLogo,
  },
  {
    name: "Solid",
    pkg: "solid",
    api: "createMemo(() => menu.connect(service, normalizeProps))",
    spread: (p: string) => `{...api().${p}}`,
    Icon: SolidIcon,
    Logo: SolidLogo,
  },
  {
    name: "Svelte",
    pkg: "svelte",
    api: "$derived(menu.connect(service, normalizeProps))",
    spread: (p: string) => `{...api.${p}}`,
    Icon: SvelteIcon,
    Logo: SvelteLogo,
  },
  {
    name: "Preact",
    pkg: "preact",
    api: "menu.connect(service, normalizeProps)",
    spread: (p: string) => `{...api.${p}}`,
    Icon: PreactIcon,
    Logo: PreactLogo,
  },
]
