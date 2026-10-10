import { defineCollections, defineConfig } from "fumadocs-mdx/config"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import remarkDirective from "remark-directive"
import { z } from "zod"
import { remarkAdmonition } from "./lib/remark-utils"
import { rehypeSvelte } from "./lib/svelte-highlight"

const docSchema = z.object({
  title: z.string(),
  description: z.string(),
  package: z.string().optional(),
  slugAlias: z.string().optional(),
})

export const overview = defineCollections({
  type: "doc",
  dir: "data/overview",
  schema: docSchema,
})

export const guides = defineCollections({
  type: "doc",
  dir: "data/guides",
  schema: docSchema,
})

export const components = defineCollections({
  type: "doc",
  dir: "data/components",
  schema: docSchema,
})

export const utilities = defineCollections({
  type: "doc",
  dir: "data/utilities",
  schema: docSchema,
})

export const snippets = defineCollections({
  type: "doc",
  dir: "data/snippets",
  schema: docSchema.partial(),
})

// Fumadocs is only the content layer here: its code highlighting, image and
// npm transforms are off, and the site keeps its own prism + Panda styling.
export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: false,
    remarkImageOptions: false,
    remarkNpmOptions: false,
    remarkCodeTabOptions: false,
    remarkPlugins: (v) => [remarkDirective, remarkAdmonition, ...v],
    rehypePlugins: (v) => [
      rehypeCodeTitles,
      [rehypeSvelte, { ignoreMissing: true }],
      ...v,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          test: ["h2", "h3", "h4"],
          properties: { className: ["anchor"] },
        },
      ],
    ],
  },
})
