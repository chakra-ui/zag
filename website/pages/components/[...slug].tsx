import type { Component } from ".velite"
import { FrameworkProvider } from "components/framework"
import { useMDX } from "components/mdx-components"
import DocsLayout from "layouts/docs"
import {
  extractParams,
  getComponentDoc,
  getComponentPaths,
} from "lib/contentlayer-utils"
import type { Framework } from "lib/framework-utils"
import type { GetStaticPaths, GetStaticProps } from "next"
import { generateNextSeo } from "next-seo/pages"
import Head from "next/head"

type PageProps = {
  doc: Component
  framework: Framework
}

export default function ComponentPage({ doc, framework }: PageProps) {
  const mdx = useMDX(doc.body.code)
  return (
    <FrameworkProvider value={framework}>
      <Head>
        {generateNextSeo({ title: doc.title, description: doc.description })}
      </Head>
      <DocsLayout doc={doc}>{mdx}</DocsLayout>
    </FrameworkProvider>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: getComponentPaths(), fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { framework, slug } = extractParams(ctx.params?.slug as string[])
  const doc = getComponentDoc(slug)
  return { props: { doc, framework } }
}
