import { allComponents } from ".contentlayer/data"
import type { Component } from ".contentlayer/types"
import { useMDX } from "components/mdx-components"

export default function Page({ page }: { page: Component }) {
  const mdx = useMDX(page.body.code)
  return <div>{mdx}</div>
}

export async function getStaticPaths() {
  return {
    paths: allComponents.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const page = allComponents.find((post) => post.slug === params.slug)
  return { props: { page } }
}
