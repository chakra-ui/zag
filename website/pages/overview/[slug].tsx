import { Overview } from ".contentlayer/types"
import { useMDX } from "components/mdx-components"
import { getOverviewDoc, getOverviewPaths } from "lib/get-paths"
import { GetStaticPaths, GetStaticProps } from "next"

export default function OverviewPage({ doc }: { doc: Overview }) {
  const mdx = useMDX(doc.body.code)
  return <div>{mdx}</div>
}

export const getStaticPaths: GetStaticPaths = async () => {
  return { paths: getOverviewPaths(), fallback: false }
}

export const getStaticProps: GetStaticProps<{ doc: Overview }> = async (ctx) => {
  return { props: { doc: getOverviewDoc(ctx.params.slug) } }
}
