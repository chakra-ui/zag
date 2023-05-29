import {
  ComputedFields,
  defineDocumentType,
  FieldDefs,
  makeSource,
  LocalDocument,
} from "contentlayer/source-files"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkDirective from "remark-directive"
import toc from "markdown-toc"
import siteConfig from "./site.config"
import { remarkAdmonition } from "./lib/remark-utils"
import { toKebabCase } from "./lib/to-kebab-case"

import fs from "fs"

const fields: FieldDefs = {
  title: { type: "string" },
  description: { type: "string" },
  package: { type: "string" },
}

const getSlug = (doc: LocalDocument) =>
  doc._raw.sourceFileName.replace(/\.mdx$/, "")

const computedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: getSlug,
  },
  editUrl: {
    type: "string",
    resolve: (doc) => `${siteConfig.repo.editUrl}/${doc._id}`,
  },
  params: {
    type: "list",
    resolve: (doc) => doc._raw.flattenedPath.split("/"),
  },
  frontmatter: {
    type: "json",
    resolve: (doc) => ({
      title: doc.title,
      description: doc.description,
      tags: doc.tags,
      author: doc.author,
      slug: `/${doc._raw.flattenedPath}`,
      toc: toc(doc.body.raw, { maxdepth: 3 }).json.filter((t) => t.lvl !== 1),
    }),
  },
}

const Overview = defineDocumentType(() => ({
  name: "Overview",
  filePathPattern: "overview/**/*.mdx",
  contentType: "mdx",
  fields,
  computedFields: {
    ...computedFields,
    pathname: {
      type: "string",
      resolve: () => "/overview/[slug]",
    },
  },
}))

const Guide = defineDocumentType(() => ({
  name: "Guide",
  filePathPattern: "guides/**/*.mdx",
  contentType: "mdx",
  fields,
  computedFields,
}))

const Component = defineDocumentType(() => ({
  name: "Component",
  filePathPattern: "components/**/*.mdx",
  contentType: "mdx",
  fields,
  computedFields: {
    ...computedFields,
    npmUrl: {
      type: "string",
      resolve: (doc) => `https://www.npmjs.com/package/${doc.package}`,
    },
    pathname: {
      type: "string",
      resolve: () => "/components/[...slug]",
    },
    sourceUrl: {
      type: "string",
      resolve: (doc) =>
        `${siteConfig.repo.url}/tree/main/packages/machines/${getSlug(doc)}`,
    },
    visualizeUrl: {
      type: "string",
      resolve: (doc) => `https://state-machine-viz.vercel.app/${getSlug(doc)}`,
    },
    version: {
      type: "string",
      resolve: (doc) => {
        try {
          const file = fs.readFileSync(
            `node_modules/${doc.package}/package.json`,
            "utf8",
          )
          return JSON.parse(file).version
        } catch {
          return ""
        }
      },
    },
  },
}))

const Snippet = defineDocumentType(() => ({
  name: "Snippet",
  filePathPattern: "snippets/**/*.mdx",
  contentType: "mdx",
  fields,
  computedFields: {
    ...computedFields,
    framework: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFilePath.split("/")[1],
    },
  },
}))

const Changelog = defineDocumentType(() => {
  const getSlug = (doc: LocalDocument) => toKebabCase(doc.releaseDate)
  return {
    name: "Changelog",
    filePathPattern: "changelogs/**/*.mdx",
    contentType: "mdx",
    fields: {
      releaseUrl: { type: "string" },
      releaseDate: { type: "string" },
    },
    computedFields: {
      editUrl: {
        type: "string",
        resolve: (doc) => `${siteConfig.repo.editUrl}/${doc._id}`,
      },
      params: {
        type: "list",
        resolve: (doc) => ["changelogs", getSlug(doc)],
      },
      frontmatter: {
        type: "json",
        resolve: (doc) => ({
          title: "Changelog",
          description: `The changes made as at ${doc.releaseDate}`,
          slug: `/changelogs/${getSlug(doc)}`,
          toc: [],
        }),
      },
      slug: {
        type: "string",
        resolve: (doc) => `/changelogs/${getSlug(doc)}`,
      },
    },
  }
})

const contentLayerConfig = makeSource({
  contentDirPath: "data",
  documentTypes: [Overview, Guide, Snippet, Component, Changelog],
  mdx: {
    remarkPlugins: [remarkGfm, remarkDirective, remarkAdmonition],
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
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
})

export default contentLayerConfig
