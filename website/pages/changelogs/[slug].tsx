import { ResourceLink, useMDX } from "components/mdx-components"
import { Changelog } from "@/contentlayer"
import DocsLayout from "layouts/docs"
import {
  getChangelogPaths,
  getChangelogToc,
  getChanglogDoc,
} from "lib/contentlayer-utils"
import { GetStaticPaths, GetStaticProps } from "next"
import { NextSeo } from "next-seo"
import { BiCalendarAlt, BiLinkAlt } from "react-icons/bi"
import { HStack, Stack } from "styled-system/jsx"
import { panda } from "styled-system/jsx"

type PageProps = {
  doc: Changelog
  toc: any
}

export default function Page(props: PageProps) {
  const { doc, toc } = props
  const mdx = useMDX(doc.body.code)
  return (
    <>
      <NextSeo
        title="Changelog"
        description={`The changes made as at ${doc.releaseUrl}`}
      />
      <DocsLayout
        doc={doc}
        toc={{
          title: "Changelog (by date)",
          data: toc,
          getSlug: (slug) => slug,
        }}
      >
        <div>
          <Stack>
            <panda.h1 textStyle="display.lg">Changelog</panda.h1>
            <panda.p textStyle="text.xl">
              Zag releases and their changelogs.
            </panda.p>

            <HStack gap="4" pt="3">
              <ResourceLink icon={BiLinkAlt} href={doc.releaseUrl}>
                Release PR
              </ResourceLink>
              <ResourceLink icon={BiCalendarAlt} href={doc.releaseUrl}>
                Date: {doc.releaseDate}
              </ResourceLink>
            </HStack>
          </Stack>

          <div>{mdx}</div>
        </div>
      </DocsLayout>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [...getChangelogPaths(), "/changelogs/latest"],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
  return {
    props: {
      doc: getChanglogDoc(ctx.params?.slug as string),
      toc: getChangelogToc(),
    },
  }
}
