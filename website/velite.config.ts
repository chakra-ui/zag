import fs from "node:fs"
import { join } from "node:path"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import remarkDirective from "remark-directive"
import { defineCollection, defineConfig, s } from "velite"
import { remarkAdmonition } from "./lib/remark-utils"
import { rehypeSvelte } from "./lib/svelte-highlight"
import siteConfig from "./site.config"

// Transform Velite TOC to legacy Contentlayer format
function transformTocToLegacyFormat(
  toc: any[],
): Array<{ content: string; slug: string; lvl: number }> {
  const result: Array<{ content: string; slug: string; lvl: number }> = []

  function processTocItems(items: any[], level: number = 2) {
    for (const item of items) {
      if (item.title && item.url) {
        result.push({
          content: item.title,
          slug: item.url.replace(/^#/, ""), // Remove # prefix
          lvl: level,
        })

        if (item.items && item.items.length > 0) {
          processTocItems(item.items, level + 1)
        }
      }
    }
  }

  // Skip the top-level items (h1) and start from their children (h2)
  for (const topLevelItem of toc) {
    if (topLevelItem.items && topLevelItem.items.length > 0) {
      processTocItems(topLevelItem.items, 2)
    }
  }

  return result
}

const overviews = defineCollection({
  name: "Overview",
  pattern: "overview/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      package: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const slug = (meta.path as string)
        .replace(/.*\/data\//, "")
        .replace(/\.mdx$/, "")
      const params = slug.split("/")

      return {
        ...data,
        slug: slug.split("/").pop() || "",
        _id: meta.path as string,
        editUrl: `${siteConfig.repo.editUrl}/${(meta.path as string)?.replace(/.*\/data\//, "")}`,
        params,
        pathname: "/overview/[slug]",
        frontmatter: {
          title: data.title,
          description: data.description,
          tags: (data as any).tags,
          author: (data as any).author,
          slug: `/${slug}`,
          toc: transformTocToLegacyFormat(data.toc),
        },
        body: {
          code: data.code,
          raw: meta.content as string,
        },
      }
    }),
})

const guides = defineCollection({
  name: "Guide",
  pattern: "guides/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      package: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const slug = (meta.path as string)
        .replace(/.*\/data\//, "")
        .replace(/\.mdx$/, "")
      const params = slug.split("/")

      return {
        ...data,
        slug: slug.split("/").pop() || "",
        _id: meta.path as string,
        editUrl: `${siteConfig.repo.editUrl}/${(meta.path as string)?.replace(/.*\/data\//, "")}`,
        params,
        frontmatter: {
          title: data.title,
          description: data.description,
          tags: (data as any).tags,
          author: (data as any).author,
          slug: `/${slug}`,
          toc: transformTocToLegacyFormat(data.toc),
        },
        body: {
          code: data.code,
          raw: meta.content as string,
        },
      }
    }),
})

const components = defineCollection({
  name: "Component",
  pattern: "components/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      package: s.string().optional(),
      slugAlias: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const slug = (meta.path as string)
        .replace(/.*\/data\//, "")
        .replace(/\.mdx$/, "")
      const params = slug.split("/")
      const packageSlug = data.slugAlias ?? slug.split("/").pop()

      return {
        ...data,
        slug: slug.split("/").pop() || "",
        _id: meta.path as string,
        editUrl: `${siteConfig.repo.editUrl}/${(meta.path as string)?.replace(/.*\/data\//, "")}`,
        params,
        pathname: "/components/[...slug]",
        npmUrl: data.package
          ? `https://www.npmjs.com/package/${data.package}`
          : "",
        sourceUrl: `${siteConfig.repo.url}/tree/main/packages/machines/${packageSlug}`,
        visualizeUrl: `https://zag-visualizer.vercel.app/${packageSlug}`,
        version: (() => {
          if (!data.package) return ""
          try {
            const file = fs.readFileSync(
              `node_modules/${data.package}/package.json`,
              "utf8",
            )
            return JSON.parse(file).version
          } catch {
            return ""
          }
        })(),
        frontmatter: {
          title: data.title,
          description: data.description,
          tags: (data as any).tags,
          author: (data as any).author,
          slug: `/${slug}`,
          toc: transformTocToLegacyFormat(data.toc),
        },
        body: {
          code: data.code,
          raw: meta.content as string,
        },
      }
    }),
})

const utilities = defineCollection({
  name: "Utility",
  pattern: "utilities/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      description: s.string(),
      package: s.string().optional(),
      slugAlias: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const slug = (meta.path as string)
        .replace(/.*\/data\//, "")
        .replace(/\.mdx$/, "")
      const params = slug.split("/")
      const packageSlug = data.slugAlias ?? slug.split("/").pop()

      return {
        ...data,
        slug: slug.split("/").pop() || "",
        _id: meta.path as string,
        editUrl: `${siteConfig.repo.editUrl}/${(meta.path as string)?.replace(/.*\/data\//, "")}`,
        params,
        pathname: "/utilities/[...slug]",
        npmUrl: data.package
          ? `https://www.npmjs.com/package/${data.package}`
          : "",
        sourceUrl: `${siteConfig.repo.url}/tree/main/packages/machines/${packageSlug}`,
        visualizeUrl: `https://zag-visualizer.vercel.app/${packageSlug}`,
        version: (() => {
          if (!data.package) return ""
          try {
            const file = fs.readFileSync(
              `node_modules/${data.package}/package.json`,
              "utf8",
            )
            return JSON.parse(file).version
          } catch {
            return ""
          }
        })(),
        frontmatter: {
          title: data.title,
          description: data.description,
          tags: (data as any).tags,
          author: (data as any).author,
          slug: `/${slug}`,
          toc: transformTocToLegacyFormat(data.toc),
        },
        body: {
          code: data.code,
          raw: meta.content as string,
        },
      }
    }),
})

const snippets = defineCollection({
  name: "Snippet",
  pattern: "snippets/**/*.mdx",
  schema: s
    .object({
      title: s.string().optional(),
      description: s.string().optional(),
      package: s.string().optional(),
      metadata: s.metadata(),
      content: s.markdown(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data, { meta }) => {
      const slug = (meta.path as string)
        .replace(/.*\/data\//, "")
        .replace(/\.mdx$/, "")
      const params = slug.split("/")

      return {
        ...data,
        title: data.title || "",
        description: data.description || "",
        slug: slug.split("/").pop() || "",
        _id: meta.path as string,
        editUrl: `${siteConfig.repo.editUrl}/${(meta.path as string)?.replace(/.*\/data\//, "")}`,
        params,
        framework: params[1] || "", // First part after snippets/
        frontmatter: {
          title: data.title || "",
          description: data.description || "",
          tags: (data as any).tags,
          author: (data as any).author,
          slug: `/${slug}`,
          toc: transformTocToLegacyFormat(data.toc),
        },
        body: {
          code: data.code,
          raw: meta.content as string,
        },
      }
    }),
})

export default defineConfig({
  root: join(process.cwd(), "./data"),
  collections: { overviews, guides, components, utilities, snippets },
  mdx: {
    remarkPlugins: [remarkDirective, remarkAdmonition],
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
      rehypeSvelte,
      rehypePrism,
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
}) as any
