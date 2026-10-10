import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"
import { Section } from "components/ui/section"
import {
  advisorMembers,
  alumniMembers,
  teamMembers,
  type TeamMember,
} from "lib/community"
import { createPageMetadata } from "lib/seo"
import { Grid, Stack, styled } from "styled-system/jsx"
import { Eyebrow } from "../community/eyebrow"
import { ProfileItem } from "../community/profile-item"
import { fetchContributors } from "./contributors"

export const metadata = createPageMetadata({
  title: "Team",
  description: "Meet the maintainers, advisors and contributors behind Zag.js.",
  path: "/team",
})

function getGithubLogin(member: TeamMember) {
  const href = member.links?.find((link) => link.label === "GitHub")?.href
  return href?.replace(/\/+$/, "").split("/").pop()
}

function MemberSection(props: {
  id: string
  eyebrow: string
  title: string
  description: string
  members: TeamMember[]
  columns?: number
}) {
  return (
    <Section id={props.id} scrollMarginTop="20" py={{ base: "8", md: "12" }}>
      <Stack mb={{ base: "8", md: "10" }} gap="3">
        <Eyebrow>{props.eyebrow}</Eyebrow>
        <styled.h2 textStyle="display.md">{props.title}</styled.h2>
        <styled.p textStyle="text.md" color="fg.muted" maxW="3xl">
          {props.description}
        </styled.p>
      </Stack>
      <Grid columns={{ base: 1, sm: 2, lg: props.columns ?? 3 }} gap="5">
        {props.members.map((member) => (
          <ProfileItem key={member.name} member={member} />
        ))}
      </Grid>
    </Section>
  )
}

export default async function TeamPage() {
  // people already shown above don't repeat in the contributor wall
  const listed = [...teamMembers, ...advisorMembers, ...alumniMembers]
    .map(getGithubLogin)
    .filter((login): login is string => Boolean(login))
  const contributors = await fetchContributors(listed)

  return (
    <styled.div>
      <TopNav />

      <Section pt={{ base: "12", md: "16" }} pb={{ base: "4", md: "6" }}>
        <Stack gap="3" my="4" maxW="3xl">
          <styled.h1 textStyle="display.xl">Team</styled.h1>
          <styled.p textStyle="text.md" color="fg.muted">
            Zag.js is built in the open by a small team of maintainers, with
            help from advisors and contributors all over the world.
          </styled.p>
        </Stack>
      </Section>

      <MemberSection
        id="maintainers"
        eyebrow="Team"
        title="Maintainers"
        description="The maintainers and developer relations shaping Zag.js day to day."
        members={teamMembers}
      />

      <MemberSection
        id="advisors"
        eyebrow="Advisors"
        title="Advisors"
        description="Builders who help guide where Zag.js goes next."
        members={advisorMembers}
      />

      <MemberSection
        id="alumni"
        eyebrow="Alumni"
        title="Past Members"
        description="Contributors whose work helped shape the project."
        members={alumniMembers}
        columns={4}
      />

      {contributors.length > 0 ? (
        <Section
          id="contributors"
          scrollMarginTop="20"
          py={{ base: "8", md: "12" }}
        >
          <Stack mb={{ base: "6", md: "8" }} gap="3">
            <Eyebrow>Contributors · {contributors.length}</Eyebrow>
            <styled.h2 textStyle="display.md">Contributors</styled.h2>
            <styled.p textStyle="text.md" color="fg.muted" maxW="3xl">
              Everyone who has shipped code to Zag.js.{" "}
              <styled.a
                href="https://github.com/chakra-ui/zag"
                target="_blank"
                rel="noopener noreferrer"
                color="fg"
                textDecoration="underline"
                textUnderlineOffset="2px"
              >
                Join them on GitHub
              </styled.a>
              .
            </styled.p>
          </Stack>
          <styled.ul listStyle="none" display="flex" flexWrap="wrap" gap="2">
            {contributors.map((person) => (
              <li key={person.login}>
                <styled.a
                  href={person.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={person.login}
                  aria-label={person.login}
                  display="flex"
                  rounded="full"
                  transition="opacity 0.15s"
                  _hover={{ opacity: 0.7 }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "green.500",
                    outlineOffset: "2px",
                  }}
                >
                  <styled.img
                    src={`${person.avatar_url}&s=80`}
                    alt=""
                    loading="lazy"
                    boxSize="10"
                    rounded="full"
                    bg="bg.muted"
                  />
                </styled.a>
              </li>
            ))}
          </styled.ul>
        </Section>
      ) : null}

      <Footer />
    </styled.div>
  )
}
