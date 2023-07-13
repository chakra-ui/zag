import { type Changelog } from "@/contentlayer"
import { Heading, HStack, Stack, Text } from "@chakra-ui/layout"
import { ResourceLink, useMDX } from "components/mdx-components"
import DocsLayout from "layouts/docs"
import {
  getChangelogPaths,
  getChangelogToc,
  getChanglogDoc,
} from "lib/contentlayer-utils"
import type { GetStaticPaths, GetStaticProps } from "next"
import { NextSeo } from "next-seo"
import { BiCalendarAlt, BiLinkAlt } from "react-icons/bi"

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
            <Heading as="h1" textStyle="display.lg">
              Changelog
            </Heading>
            <Text textStyle="text.xl">Zag releases and their changelogs.</Text>

            <HStack spacing="4" pt="3">
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
