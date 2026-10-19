import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import {
  Band,
  cells,
  Eyebrow,
  Frame,
  Lead,
  Pad,
  Title,
} from "components/lab/kit"
import { communityLinks, communityProjects, recordings } from "lib/community"
import { createPageMetadata } from "lib/seo"
import { Suspense } from "react"
import { FaGithub, FaNpm } from "react-icons/fa6"
import { Box, Grid, Stack, styled } from "styled-system/jsx"
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

function SectionHeading(props: {
  label: string
  title: string
  description: string
}) {
  return (
    <Box maxW="3xl" mb={{ base: "8", md: "10" }}>
      <Eyebrow mb="3">{props.label}</Eyebrow>
      <Title mb="3">{props.title}</Title>
      <Lead>{props.description}</Lead>
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
      <Frame>
        <Grid columns={{ base: 1, lg: 2 }} gap="0">
          <Pad>
            <Eyebrow mb="3">Community</Eyebrow>
            <Title as="h1">Build with other people building on Zag</Title>
            <Lead mt="4">
              Ask questions, catch up on recordings, and find projects made on
              top of Zag.
            </Lead>
            <styled.a
              href="/team"
              display="inline-block"
              mt="6"
              fontFamily="mono"
              fontSize="13px"
              color="text.bold"
              _hover={{ textDecoration: "underline" }}
            >
              Meet the team →
            </styled.a>
          </Pad>
          <Stack
            as="nav"
            aria-label="Join the community"
            gap="0"
            justify="center"
            px={{ base: "4", sm: "6", md: "10" }}
            py={{ base: "6", md: "10" }}
            borderLeftWidth={{ base: "0", lg: "1px" }}
            borderTopWidth={{ base: "1px", lg: "0" }}
            borderColor="border"
          >
            {communityLinks.map((link) => (
              <CommunityLink key={link.href} link={link} />
            ))}
          </Stack>
        </Grid>

        {stats ? (
          <Grid className={cells} gap="1px" columns={{ base: 1, sm: 2 }}>
            <Box px={{ base: "6", md: "10" }} py="8">
              <CommunityStat
                href="https://www.npmjs.com/package/@zag-js/core"
                label="Downloads"
                value={stats.npmTotalDownloads}
                subLabel="@zag-js/core"
                icon={<FaNpm size="24" />}
              />
            </Box>
            <Box px={{ base: "6", md: "10" }} py="8">
              <CommunityStat
                href="https://github.com/chakra-ui/zag"
                label="Stars"
                value={stats.githubStars}
                subLabel="chakra-ui/zag"
                icon={<FaGithub size="16" />}
              />
            </Box>
          </Grid>
        ) : null}

        <Band id="recordings" scrollMarginTop="20">
          <Pad>
            <SectionHeading
              label="Watch"
              title="Recordings"
              description="Talks and conversations from the Zag.js journey."
            />
            <Grid columns={{ base: 1, md: 2 }} gap="4">
              {recordings.map((video) => (
                <RecordingItem key={video.href} video={video} />
              ))}
            </Grid>
          </Pad>
        </Band>

        <Band id="ecosystem" scrollMarginTop="20">
          <Pad>
            <SectionHeading
              label="Ecosystem"
              title="Community packages"
              description="Adapters and packages built on top of Zag machines. They're maintained by their authors, not the Zag team."
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
          </Pad>
        </Band>
      </Frame>

      <Footer />
    </Box>
  )
}
