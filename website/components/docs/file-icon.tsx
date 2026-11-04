import type { IconType } from "react-icons"
import { LuFileCode, LuTerminal } from "react-icons/lu"
import {
  SiCss,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiMarkdown,
  SiMdx,
  SiReact,
  SiSvelte,
  SiTypescript,
  SiVuedotjs,
  SiYaml,
} from "react-icons/si"
import * as styles from "./file-icon.css"

const icons: Record<string, IconType> = {
  ts: SiTypescript,
  mts: SiTypescript,
  cts: SiTypescript,
  tsx: SiReact,
  jsx: SiReact,
  js: SiJavascript,
  mjs: SiJavascript,
  cjs: SiJavascript,
  css: SiCss,
  html: SiHtml5,
  json: SiJson,
  vue: SiVuedotjs,
  svelte: SiSvelte,
  md: SiMarkdown,
  mdx: SiMdx,
  yml: SiYaml,
  yaml: SiYaml,
  sh: LuTerminal,
}

/** The icon for a file name, tinted with its language's color */
export function FileIcon(props: { name: string }) {
  const ext = props.name.split(".").pop()?.toLowerCase() ?? ""
  const Icon = icons[ext] ?? LuFileCode
  return (
    <Icon
      className={styles.icon}
      data-ext={icons[ext] ? ext : undefined}
      aria-hidden
    />
  )
}
