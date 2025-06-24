import type { Guide } from "@/contentlayer"
import { useMDX } from "components/mdx-components"
import DocsLayout from "layouts/docs"
import { getGuideDoc, getGuidePaths } from "lib/contentlayer-utils"
import type { GetStaticPaths, GetStaticProps } from "next"
import { NextSeo } from "next-seo"

export default function GuidePage({ doc }: { doc: Guide }) {
  const Component = useMDX(doc?.body.code)
  if (!doc) return null
  return (
    <>
      <NextSeo title={doc.title} description={doc.description} />
      <DocsLayout doc={doc}>{Component}</DocsLayout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: getGuidePaths(), fallback: false }
}

export const getStaticProps: GetStaticProps<{ doc: Guide }> = async (ctx) => {
  return {
    props: { doc: getGuideDoc(ctx.params?.slug as string) as Guide },
  }
}
