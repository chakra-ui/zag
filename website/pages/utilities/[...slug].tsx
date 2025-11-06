import type { Utility } from ".velite"
import { FrameworkProvider } from "components/framework"
import { useMDX } from "components/mdx-components"
import DocsLayout from "layouts/docs"
import {
  extractParams,
  getUtilityDoc,
  getUtilityPaths,
} from "lib/contentlayer-utils"
import type { Framework } from "lib/framework-utils"
import type { GetStaticPaths, GetStaticProps } from "next"
import { generateNextSeo } from "next-seo/pages"
import Head from "next/head"

type PageProps = {
  doc: Utility
  framework: Framework
}

export default function UtilityPage({ doc, framework }: PageProps) {
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
  return { paths: getUtilityPaths(), fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { framework, slug } = extractParams(ctx.params?.slug as string[])
  const doc = getUtilityDoc(slug)
  return { props: { doc, framework } }
}
