import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { Section } from "components/ui/section"
import { communityLinks, communityProjects, recordings } from "lib/community"
import { createPageMetadata } from "lib/seo"
import { Suspense } from "react"
import { FaGithub, FaNpm } from "react-icons/fa6"
import { Box, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { CommunityLink } from "./community-link"
import { CommunityProjects } from "./community-projects"
import { CommunityStat } from "./community-stat"
import { RecordingItem } from "./recording-item"
import { getCommunityStats } from "./stats"

export const metadata = createPageMetadata({
  title: "Community",
  description:
    "Connect with the Zag.js community, watch recordings, and discover ecosystem projects.",
  path: "/community",
})

function SectionHeading(props: { title: string; description: string }) {
  return (
    <Box maxW="3xl" mb={{ base: "8", md: "10" }}>
      <styled.h2 textStyle="display.lg" mb="3">
        {props.title}
      </styled.h2>
      <styled.p textStyle="text.md" color="text.muted">
        {props.description}
      </styled.p>
    </Box>
  )
}

const addProjectHref =
  "https://github.com/chakra-ui/zag/issues/new?title=Add%20community%20project%3A%20"

export default async function CommunityPage() {
  const stats = await getCommunityStats()

  return (
    <Box>
      <TopNav />

      <Section pt={{ base: "12", md: "16" }} pb={{ base: "8", md: "12" }}>
        <Grid
          columns={{ base: 1, lg: 2 }}
          gap={{ base: "10", lg: "16" }}
          alignItems="start"
        >
          <Stack gap="3" my="4">
            <styled.h1 textStyle="display.xl">Community</styled.h1>
            <styled.p textStyle="text.md" color="text.muted" maxW="60ch">
              Connect with other builders, catch up on recordings, and find
              projects made on top of Zag.
            </styled.p>
            {stats ? (
              <HStack gap="10" mt="6">
                <CommunityStat
                  href="https://www.npmjs.com/package/@zag-js/core"
                  label="Downloads"
                  value={stats.npmTotalDownloads}
                  subLabel="@zag-js/core"
                  icon={<FaNpm size="24" />}
                />
                <CommunityStat
                  href="https://github.com/chakra-ui/zag"
                  label="Stars"
                  value={stats.githubStars}
                  subLabel="chakra-ui/zag"
                  icon={<FaGithub size="16" />}
                />
              </HStack>
            ) : null}
            <styled.a
              href="/team"
              mt="6"
              alignSelf="flex-start"
              fontSize="sm"
              fontWeight="medium"
              color="text.primary.bold"
              _hover={{ textDecoration: "underline" }}
            >
              Meet the team →
            </styled.a>
          </Stack>

          <Stack as="nav" aria-label="Join the community" gap="1">
            {communityLinks.map((link) => (
              <CommunityLink key={link.href} link={link} />
            ))}
          </Stack>
        </Grid>
      </Section>

      <Section
        id="recordings"
        scrollMarginTop="20"
        py={{ base: "8", md: "12" }}
      >
        <SectionHeading
          title="Recordings"
          description="Watch talks and recordings from the Zag.js journey."
        />
        <Grid columns={{ base: 1, md: 2 }} gap="6">
          {recordings.map((video) => (
            <RecordingItem key={video.href} video={video} />
          ))}
        </Grid>
      </Section>

      <Section id="ecosystem" scrollMarginTop="20" py={{ base: "8", md: "12" }}>
        <SectionHeading
          title="Ecosystem"
          description="Adapters and packages built by the community on top of Zag machines. They're maintained by their authors, not the Zag team."
        />
        <styled.p fontSize="sm" color="text.muted" mb="6">
          Built something on Zag?{" "}
          <styled.a
            href={addProjectHref}
            target="_blank"
            rel="noopener noreferrer"
            color="text"
            textDecoration="underline"
            textUnderlineOffset="2px"
          >
            Add it to the list
          </styled.a>
          .
        </styled.p>
        <Suspense>
          <CommunityProjects projects={communityProjects} />
        </Suspense>
      </Section>

      <Footer />
    </Box>
  )
}
