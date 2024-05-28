import {
  defineDocumentType,
  makeSource,
  type ComputedFields,
  type FieldDefs,
  type LocalDocument,
} from "contentlayer/source-files"
import fs from "fs"
import toc from "markdown-toc"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import remarkDirective from "remark-directive"
import { remarkAdmonition } from "./lib/remark-utils"
import siteConfig from "./site.config"
import svelte from "./lib/svelte-highlight"

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
  fields: {
    ...fields,
    slugAlias: { type: "string" },
  },
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
        `${siteConfig.repo.url}/tree/main/packages/machines/${
          doc.slugAlias ?? getSlug(doc)
        }`,
    },
    visualizeUrl: {
      type: "string",
      resolve: (doc) =>
        `https://state-machine-viz.vercel.app/${doc.slugAlias ?? getSlug(doc)}`,
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

export default makeSource({
  contentDirPath: "./data",
  contentDirExclude: ["*/node_modules", "dist"],
  documentTypes: [Overview, Guide, Snippet, Component],
  disableImportAliasWarning: true,
  onUnknownDocuments: "skip-ignore",
  mdx: {
    remarkPlugins: [remarkDirective, remarkAdmonition],
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
      svelte,
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
