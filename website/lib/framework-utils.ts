import { AiFillCode } from "react-icons/ai"
import { FaVuejs } from "react-icons/fa"
import { SiReact } from "react-icons/si"
// import { RiSvelteLine } from "react-icons/ri";

export const frameworks = {
  react: { icon: SiReact, label: "React" },
  solid: { icon: AiFillCode, label: "Solid" },
  vue: { icon: FaVuejs, label: "Vue" },
  // svelte: { icon: RiSvelteLine, label: "Svelte" },
}

export const FRAMEWORKS = Object.keys(frameworks) as Framework[]

export type Framework = keyof typeof frameworks

export function isFramework(str: string): str is Framework {
  return FRAMEWORKS.includes(str as any)
}

export function getFrameworkIndex(str: string): number {
  return FRAMEWORKS.indexOf(str as any)
}
