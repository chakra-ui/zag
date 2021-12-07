import type { Component } from ".contentlayer/types"
import { useMDX } from "components/mdx-components"
import { Framework, FrameworkContext } from "lib/framework"
import { extractParams, getComponentDoc, getComponentPaths } from "lib/get-paths"
import { GetStaticPaths, GetStaticProps } from "next"

export default function ComponentPage({ doc, framework }: { doc: Component; framework: Framework }) {
  const mdx = useMDX(doc.body.code)
  return (
    <FrameworkContext.Provider value={framework}>
      <div>{mdx}</div>
    </FrameworkContext.Provider>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: getComponentPaths(), fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const { framework, slug } = extractParams(ctx.params.slug as string[])
  const doc = getComponentDoc(slug)
  return { props: { doc, framework } }
}
