import {
  components,
  guides,
  overviews,
  snippets,
  utilities,
  type Component,
  type Guide,
  type Overview,
  type Snippet,
  type Utility,
} from ".velite"
import { FRAMEWORKS, isFramework, type Framework } from "./framework-utils"

function toParams(str: string | string[]) {
  const slug = Array.isArray(str) ? str : [str]
  return { params: { slug } }
}

export function extractParams(slug: string[]) {
  const [first] = slug
  let result: Framework = "react"
  if (isFramework(first)) {
    result = first
    slug.shift()
  }
  return { framework: result, slug: slug.join("/") }
}

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

export function getComponentDoc(slug: string): Component | undefined {
  return components.find(
    (post) => post.frontmatter.slug === `/components/${slug}`,
  )
}

/* -----------------------------------------------------------------------------
 * Overview
 * -----------------------------------------------------------------------------*/

export function getOverviewPaths() {
  return overviews.map((doc) => `/overview/${doc.slug}`)
}

export function getOverviewDoc(_slug: string | string[]): Overview | undefined {
  const slug = Array.isArray(_slug) ? _slug[0] : _slug
  return overviews.find((post) => post.frontmatter.slug === `/overview/${slug}`)
}

/* -----------------------------------------------------------------------------
 * Guide
 * -----------------------------------------------------------------------------*/

export function getGuidePaths() {
  return guides.map((doc) => `/guides/${doc.slug}`)
}

export function getGuideDoc(slug: string | string[]): Guide | undefined {
  return guides.find((post) => post.frontmatter.slug === `/guides/${slug}`)
}

/* -----------------------------------------------------------------------------
 * Snippet
 * -----------------------------------------------------------------------------*/

export function getSnippetPaths() {
  return snippets.map((doc) => `/snippets/${doc.slug}`)
}

export function getSnippetDoc(slug: string | string[]): Snippet | undefined {
  return snippets.find(
    (snippet) => snippet.frontmatter.slug === `/snippets/${slug}`,
  )
}

/* -----------------------------------------------------------------------------
 * Utility
 * -----------------------------------------------------------------------------*/

export function getUtilityPaths() {
  return utilities.map((doc) => `/utilities/${doc.slug}`)
}

export function getUtilityDoc(slug: string | string[]): Utility | undefined {
  return utilities.find(
    (utility) => utility.frontmatter.slug === `/utilities/${slug}`,
  )
}
