import fs from "node:fs"
import { join } from "node:path"
import type { MDXComponents } from "mdx/types"
import type { ComponentType, ReactNode } from "react"
import siteConfig from "site.config"
import {
  blog as blogEntries,
  components as componentEntries,
  guides as guideEntries,
  overview as overviewEntries,
  snippets as snippetEntries,
  utilities as utilityEntries,
} from "../.source/server"
import { FRAMEWORKS, isFramework, type Framework } from "./framework-utils"

type Entry = (typeof componentEntries)[number]

export type DocBody = ComponentType<{ components?: MDXComponents }>

export interface TocItem {
  content: string
  slug: string
  lvl: number
}

/** Serializable page data. The MDX body is looked up separately with `getBody`. */
export interface Doc {
  _id: string
  slug: string
  title: string
  description: string
  package?: string
  editUrl: string
  pathname: string
  params: string[]
  npmUrl?: string
  sourceUrl?: string
  visualizeUrl?: string
  version?: string
  frontmatter: {
    title: string
    description: string
    slug: string
    toc: TocItem[]
  }
  body: { raw: string }
}

/** A component or utility page, which always has package links */
export type PackageDoc = Doc &
  Required<Pick<Doc, "npmUrl" | "version" | "sourceUrl">>

export interface Snippet {
  /** path under `data/snippets` without `.mdx`, e.g. `react/accordion/usage` */
  key: string
  /** `accordion/usage.mdx`, the id `<CodeSnippet id>` points at */
  id: string
  framework: string
  body: { raw: string }
}

const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/

function readRaw(entry: { info: { fullPath: string } }) {
  return fs
    .readFileSync(entry.info.fullPath, "utf8")
    .replace(FRONTMATTER, "")
    .trim()
}

function nodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join("")
  if (typeof node === "object" && "props" in node) {
    return nodeText((node.props as { children?: ReactNode }).children)
  }
  return ""
}

// Docs pages have no H1 in the body, so the TOC starts at H2
function toToc(entry: Entry): TocItem[] {
  return entry.toc
    .filter((item) => item.depth >= 2)
    .map((item) => ({
      content: nodeText(item.title),
      slug: item.url.replace(/^#/, ""),
      lvl: item.depth,
    }))
}

function packageVersion(pkg?: string) {
  if (!pkg) return ""
  try {
    const file = fs.readFileSync(`node_modules/${pkg}/package.json`, "utf8")
    return JSON.parse(file).version
  } catch {
    return ""
  }
}

function resolvePackageSource(packageSlug: string) {
  const candidates = [
    `packages/utilities/${packageSlug}`,
    `packages/machines/${packageSlug}`,
  ]
  const roots = [process.cwd(), join(process.cwd(), "..")]
  const sourceDir =
    candidates.find((dir) =>
      roots.some((root) => fs.existsSync(join(root, dir))),
    ) ?? `packages/utilities/${packageSlug}`

  return {
    sourceUrl: `${siteConfig.repo.treeUrl}/${sourceDir}`,
    visualizeUrl: sourceDir.startsWith("packages/machines/")
      ? `https://zag-visualizer.vercel.app/${packageSlug}`
      : "",
  }
}

type Category = "overview" | "guides" | "components" | "utilities"

const pathnames: Record<Category, string> = {
  overview: "/overview/[slug]",
  guides: "/guides/[slug]",
  components: "/components/[...slug]",
  utilities: "/utilities/[...slug]",
}

function toDoc(entry: Entry, category: Category): Doc {
  const slug = entry.info.path.replace(/\.mdx$/, "")
  const dataPath = `${category}/${entry.info.path}`
  const packageSlug = entry.slugAlias ?? slug

  const doc: Doc = {
    _id: entry.info.fullPath,
    slug,
    title: entry.title,
    description: entry.description,
    package: entry.package,
    editUrl: `${siteConfig.repo.editUrl}/${dataPath}`,
    pathname: pathnames[category],
    params: [category, slug],
    frontmatter: {
      title: entry.title,
      description: entry.description,
      slug: `/${category}/${slug}`,
      toc: toToc(entry),
    },
    body: { raw: readRaw(entry) },
  }

  if (category === "components") {
    doc.sourceUrl = `${siteConfig.repo.treeUrl}/packages/machines/${packageSlug}`
    doc.visualizeUrl = `https://zag-visualizer.vercel.app/${packageSlug}`
  }

  if (category === "utilities") {
    Object.assign(doc, resolvePackageSource(packageSlug))
  }

  if (category === "components" || category === "utilities") {
    doc.npmUrl = entry.package
      ? `https://www.npmjs.com/package/${entry.package}`
      : ""
    doc.version = packageVersion(entry.package)
  }

  return doc
}

const entries: Record<Category, Entry[]> = {
  overview: overviewEntries,
  guides: guideEntries,
  components: componentEntries,
  utilities: utilityEntries,
}

export const components = componentEntries.map(
  (e) => toDoc(e, "components") as PackageDoc,
)
export const overviews = overviewEntries.map((e) => toDoc(e, "overview"))
export const guides = guideEntries.map((e) => toDoc(e, "guides"))
export const utilities = utilityEntries.map(
  (e) => toDoc(e, "utilities") as PackageDoc,
)

export const snippets: Snippet[] = snippetEntries.map((entry) => {
  const key = entry.info.path.replace(/\.mdx$/, "")
  const [framework, ...rest] = key.split("/")
  return {
    key,
    id: `${rest.join("/")}.mdx`,
    framework,
    body: { raw: readRaw(entry) },
  }
})

export function getBody(category: Category, slug: string) {
  const entry = entries[category].find((e) => e.info.path === `${slug}.mdx`)
  return entry?.body as DocBody | undefined
}

/**
 * The first paragraph under each heading, keyed by heading id ("" for the
 * intro), from the structured data fumadocs extracts at build time. Search uses it.
 */
export function getSectionText(category: Category | "blog", slug: string) {
  const list = category === "blog" ? blogEntries : entries[category]
  const entry = list.find((e) => e.info.path === `${slug}.mdx`)
  const sections = new Map<string, string>()
  for (const { heading = "", content } of entry?.structuredData.contents ??
    []) {
    if (!sections.has(heading)) sections.set(heading, content)
  }
  return sections
}

export function getSnippetBody(key: string) {
  const entry = snippetEntries.find((e) => e.info.path === `${key}.mdx`)
  return entry?.body as DocBody | undefined
}

function toParams(str: string | string[]) {
  const slug = Array.isArray(str) ? str : [str]
  return { params: { slug } }
}

export function extractParams(slug: string[]) {
  const parts = [...slug]
  const [first] = parts
  let result: Framework = "react"
  if (isFramework(first)) {
    result = first
    parts.shift()
  }
  return { framework: result, slug: parts.join("/") }
}

const firstSlug = (slug: string | string[]) =>
  Array.isArray(slug) ? slug[0] : slug

/* -----------------------------------------------------------------------------
 * Component
 * -----------------------------------------------------------------------------*/

export function getComponentPaths() {
  const paths: string[][] = []

  for (const doc of components) {
    paths.push([doc.slug])
    for (const framework of FRAMEWORKS) {
      paths.push([framework, doc.slug])
    }
  }

  return paths.map(toParams)
}

export function getComponentDoc(slug: string) {
  return components.find((doc) => doc.slug === slug)
}

/* -----------------------------------------------------------------------------
 * Overview
 * -----------------------------------------------------------------------------*/

export function getOverviewPaths() {
  return overviews.map((doc) => ({ slug: doc.slug }))
}

export function getOverviewDoc(slug: string | string[]) {
  return overviews.find((doc) => doc.slug === firstSlug(slug))
}

/* -----------------------------------------------------------------------------
 * Guide
 * -----------------------------------------------------------------------------*/

export function getGuidePaths() {
  return guides.map((doc) => ({ slug: doc.slug }))
}

export function getGuideDoc(slug: string | string[]) {
  return guides.find((doc) => doc.slug === firstSlug(slug))
}

/* -----------------------------------------------------------------------------
 * Snippet
 * -----------------------------------------------------------------------------*/

export function getSnippetDoc(key: string) {
  return snippets.find((snippet) => snippet.key === key)
}

/* -----------------------------------------------------------------------------
 * Utility
 * -----------------------------------------------------------------------------*/

export function getUtilityPaths() {
  return utilities.map((doc) => ({ slug: doc.slug }))
}

export function getUtilityDoc(slug: string | string[]) {
  return utilities.find((doc) => doc.slug === firstSlug(slug))
}

export interface Author {
  name: string
  github: string
}

export interface Post {
  slug: string
  title: string
  description: string
  date: Date
  type: "article" | "release"
  featured?: boolean
  authors: Author[]
  readingTime: number
  toc: TocItem[]
}

/** Blog posts, newest first */
export const posts: Post[] = blogEntries
  .map((entry) => ({
    slug: entry.info.path.replace(/\.mdx$/, ""),
    title: entry.title,
    description: entry.description,
    date: entry.date,
    type: entry.type,
    featured: entry.featured,
    authors: entry.authors,
    // 200 words a minute, same as the Panda blog
    readingTime: Math.max(
      1,
      Math.ceil(readRaw(entry).split(/\s+/).length / 200),
    ),
    toc: toToc(entry as unknown as Entry),
  }))
  .sort((a, b) => b.date.getTime() - a.date.getTime())

export function getPostBody(slug: string) {
  const entry = blogEntries.find((e) => e.info.path === `${slug}.mdx`)
  return entry?.body as DocBody | undefined
}
