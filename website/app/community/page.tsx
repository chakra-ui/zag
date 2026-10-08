import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { Section } from "components/ui/section"
import {
  communityLinks,
  communityProjects,
  recordings,
  sampleCommunityProjects,
} from "lib/community"
import { createPageMetadata } from "lib/seo"
import { FaGithub, FaNpm } from "react-icons/fa6"
import { Box, Flex, Grid, HStack, Stack, styled } from "styled-system/jsx"
import { CommunityLink } from "./community-link"
import { CommunityProjects } from "./community-projects"
import { CommunityStat } from "./community-stat"
import { Eyebrow } from "./eyebrow"
import { RecordingItem } from "./recording-item"
import { getCommunityStats } from "./stats"

export const metadata = createPageMetadata({
  title: "Community",
  description:
    "Connect with the Zag.js community, discover community projects, and watch recordings.",
  path: "/community",
})

function SectionHeading(props: { title: string; description: string }) {
  return (
    <Box maxW="3xl" mb={{ base: "8", md: "10" }}>
      <styled.h2 textStyle="display.lg" mb="3">
        {props.title}
      </styled.h2>
      <styled.p textStyle="text.md" color="fg.muted">
        {props.description}
      </styled.p>
    </Box>
  )
}

// samples stand in on local and preview builds until real entries exist, never in production
const showSamples =
  communityProjects.length === 0 && process.env.VERCEL_ENV !== "production"
const projects = showSamples ? sampleCommunityProjects : communityProjects
const addProjectHref =
  "https://github.com/chakra-ui/zag/issues/new?title=Add%20community%20project%3A%20"

const jumpLinks = [
  { label: "Community projects", href: "#projects" },
  { label: "Recordings", href: "#recordings" },
  { label: "Meet the team →", href: "/team" },
]

export default async function CommunityPage() {
  const stats = await getCommunityStats()

  return (
    <Box>
      <TopNav />

      <Section pt={{ base: "12", md: "16" }} pb={{ base: "8", md: "10" }}>
        <Grid columns={{ base: 1, md: 2 }} gap={{ base: "6", md: "8" }}>
          <Stack gap="3" my="4">
            <styled.h1 textStyle="display.xl">Community</styled.h1>
            <styled.p textStyle="text.md" color="fg.muted" maxW="60ch">
              Connect with other builders, find projects made on top of Zag, and
              catch up on recordings.
            </styled.p>
            <HStack
              as="nav"
              aria-label="On this page"
              gap="2"
              flexWrap="wrap"
              mt="2"
            >
              {jumpLinks.map((link) => (
                <styled.a
                  key={link.href}
                  href={link.href}
                  px="3"
                  h="8"
                  display="inline-flex"
                  alignItems="center"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  fontSize="sm"
                  color="fg.muted"
                  transition="all 0.2s"
                  _hover={{ color: "fg", borderColor: "border.emphasized" }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "green.500",
                    outlineOffset: "2px",
                  }}
                >
                  {link.label}
                </styled.a>
              ))}
            </HStack>
          </Stack>

          {stats ? (
            <Flex
              gap="4"
              maxW={{ md: "md" }}
              w="full"
              justifySelf="flex-end"
              alignItems={{ md: "center" }}
            >
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
            </Flex>
          ) : null}
        </Grid>
      </Section>

      <Section py={{ base: "8", md: "12" }}>
        <Stack gap="2" mb="4">
          <styled.h2 textStyle="display.sm">Join the community</styled.h2>
          <styled.p textStyle="text.md" color="fg.muted">
            Help shape the future of Zag.js, and stay updated.
          </styled.p>
        </Stack>
        <Grid columns={{ base: 2, sm: 4 }} gap="3" mt="10">
          {communityLinks.map((link) => (
            <CommunityLink key={link.href} link={link} />
          ))}
        </Grid>
      </Section>

      <Section id="projects" scrollMarginTop="20" py={{ base: "8", md: "12" }}>
        <Stack mb={{ base: "8", md: "10" }} gap="3">
          <Eyebrow>Ecosystem</Eyebrow>
          <styled.h2 textStyle="display.lg">Community projects</styled.h2>
          <styled.p textStyle="text.md" color="fg.muted" maxW="3xl">
            Adapters and packages built by the community on top of Zag machines.
            They're maintained by their authors, not the Zag team.
          </styled.p>
        </Stack>
        <Stack gap="4" mb="6" maxW="3xl">
          <Box
            px="4"
            py="3"
            rounded="lg"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.subtle"
            fontSize="sm"
            color="fg.muted"
          >
            Community projects are built and maintained by third-party
            developers. Review the code before you use them.
          </Box>
          <styled.p fontSize="sm" color="fg.muted">
            Built something on Zag?{" "}
            <styled.a
              href={addProjectHref}
              target="_blank"
              rel="noopener noreferrer"
              color="fg"
              textDecoration="underline"
              textUnderlineOffset="2px"
            >
              Add it to the list
            </styled.a>
            .
          </styled.p>
        </Stack>
        {projects.length > 0 ? (
          <CommunityProjects projects={projects} sample={showSamples} />
        ) : (
          <Box
            p="8"
            rounded="2xl"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="border.subtle"
            color="fg.muted"
            textAlign="center"
          >
            No community projects listed yet. Be the first to add one.
          </Box>
        )}
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

      <Footer />
    </Box>
  )
}
