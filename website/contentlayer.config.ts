import { ComputedFields, defineDocumentType, FieldDefs, makeSource } from "contentlayer/source-files"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeCodeTitles from "rehype-code-titles"
import rehypePrism from "rehype-prism-plus"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import getTableOfContents from "./lib/get-toc"
import siteConfig from "./site.config"

const fields: FieldDefs = {
  title: { type: "string" },
  description: { type: "string" },
  package: { type: "string" },
}

const computedFields: ComputedFields = {
  slug: {
    type: "string",
    resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, ""),
  },
  editUrl: {
    type: "string",
    resolve: (doc) => `${siteConfig.repo.editUrl}/${doc._id}`,
  },
  frontmatter: {
    type: "json",
    resolve: (doc) => ({
      title: doc.title,
      description: doc.description,
      tags: doc.tags,
      author: doc.author,
      slug: `/${doc._raw.flattenedPath}`,
      headings: getTableOfContents(doc.body.raw),
    }),
  },
}

const Overview = defineDocumentType(() => ({
  name: "Overview",
  filePathPattern: "overview/**/*.mdx",
  bodyType: "mdx",
  fields,
  computedFields,
}))

const Guide = defineDocumentType(() => ({
  name: "Guide",
  filePathPattern: "guides/**/*.mdx",
  bodyType: "mdx",
  fields,
  computedFields,
}))

const Component = defineDocumentType(() => ({
  name: "Component",
  filePathPattern: "components/**/*.mdx",
  bodyType: "mdx",
  fields,
  computedFields,
}))

const Snippet = defineDocumentType(() => ({
  name: "Snippet",
  filePathPattern: "snippets/**/*.mdx",
  bodyType: "mdx",
  fields,
  computedFields: {
    ...computedFields,
    framework: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFilePath.split("/")[1],
    },
  },
}))

const contentLayerConfig = makeSource({
  contentDirPath: "data",
  documentTypes: [Overview, Guide, Snippet, Component],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      rehypeCodeTitles,
      rehypePrism,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ["anchor"],
          },
        },
      ],
    ],
  },
})

export default contentLayerConfig
