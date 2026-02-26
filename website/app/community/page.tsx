import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { Section } from "components/ui/section"
import {
  alumniMembers,
  communityLinks,
  recordings,
  teamMembers,
} from "lib/community"
import type { Metadata } from "next"
import { FaGithub, FaNpm } from "react-icons/fa6"
import { Box, Flex, Grid, Stack, styled } from "styled-system/jsx"
import { CommunityLink } from "./community-link"
import { CommunityStat } from "./community-stat"
import { ProfileItem } from "./profile-item"
import { RecordingItem } from "./recording-item"
import { getCommunityStats } from "./stats"

export const metadata: Metadata = {
  title: "Community",
  description:
    "Connect with the Zag.js community, meet the team, watch recordings, and discover ecosystem projects.",
}

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
              Meet the people behind Zag, connect with other builders, and catch
              up on recordings.
            </styled.p>
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

      <Section py={{ base: "8", md: "12" }}>
        <Stack mb={{ base: "8", md: "10" }} gap="3">
          <styled.span
            fontFamily="mono"
            fontSize="xs"
            color="fg.subtle"
            textTransform="uppercase"
            letterSpacing="0.14em"
          >
            Team
          </styled.span>
          <styled.h2 textStyle="display.lg">
            We are a team of open-source builders.
          </styled.h2>
          <styled.p textStyle="text.md" color="fg.muted" maxW="3xl">
            Active contributors shaping Zag.js day to day.
          </styled.p>
        </Stack>
        <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
          {teamMembers.map((member) => (
            <ProfileItem key={member.name} member={member} />
          ))}
        </Grid>
      </Section>

      <Section py={{ base: "8", md: "12" }}>
        <Stack mb={{ base: "8", md: "10" }} gap="3">
          <styled.span
            fontFamily="mono"
            fontSize="xs"
            color="fg.subtle"
            textTransform="uppercase"
            letterSpacing="0.14em"
          >
            Alumni
          </styled.span>
          <styled.h2 textStyle="display.md">Past Members</styled.h2>
          <styled.p textStyle="text.md" color="fg.muted" maxW="3xl">
            Contributors whose work helped shape the project.
          </styled.p>
        </Stack>
        <Grid columns={{ base: 1, sm: 2, lg: 4 }} gap="5">
          {alumniMembers.map((member) => (
            <ProfileItem key={member.name} member={member} />
          ))}
        </Grid>
      </Section>

      <Section py={{ base: "8", md: "12" }}>
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
