import { allComponents } from ".contentlayer/data"
import type { Component } from ".contentlayer/types"
import { useMDX } from "components/mdx-components"
import { Framework, FrameworkContext, FRAMEWORKS } from "lib/framework"
import { GetStaticPaths, GetStaticProps } from "next"

export default function Page({ page, framework }: { page: Component; framework: Framework }) {
  const mdx = useMDX(page.body.code)
  return (
    <FrameworkContext.Provider value={framework}>
      <div>{mdx}</div>
    </FrameworkContext.Provider>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  let paths = allComponents
    .map((p) => FRAMEWORKS.map((s) => [s, ...p.params]))
    .flat()
    .map((slug) => ({ params: { slug } }))
  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params.slug as any[]
  const isFramework = FRAMEWORKS.includes(slug[0])
  let framework = "react"
  if (isFramework) {
    framework = slug.shift()
  }
  const _slug = slug.join("/")
  const page = allComponents.find((post) => post.frontmatter.slug.endsWith(_slug))
  return { props: { page, framework } }
}
