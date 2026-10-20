import { Footer } from "components/footer"
import { Band, Eyebrow, Frame, Lead, Pad, Title } from "components/lab/kit"
import { TopNav } from "components/nav/top-nav"
import {
  advisorMembers,
  alumniMembers,
  teamMembers,
  type TeamMember,
} from "lib/community"
import { createPageMetadata } from "lib/seo"
import type { ReactNode } from "react"
import { css } from "styled-system/css"
import { Box, styled } from "styled-system/jsx"
import { ProfileItem } from "../community/profile-item"
import { fetchContributors } from "./contributors"

export const metadata = createPageMetadata({
  title: "Team",
  description: "Meet the maintainers, advisors and contributors behind Zag.js.",
  path: "/team",
})

const grid = css({
  gap: "1px",
  bg: "border",
  borderTopWidth: "1px",
  borderColor: "border",
  "& > *": { bg: "bg" },
})

function getGithubLogin(member: TeamMember) {
  const href = member.links?.find((link) => link.label === "GitHub")?.href
  return href?.replace(/\/+$/, "").split("/").pop()
}

function GroupHeading(props: {
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <Box
      px={{ base: "4", sm: "6", md: "10" }}
      pt={{ base: "10", md: "14" }}
      pb={{ base: "8", md: "10" }}
    >
      <Eyebrow mb="3">{props.label}</Eyebrow>
      <styled.h2
        fontSize={{ base: "22px", md: "26px" }}
        lineHeight="1.15"
        letterSpacing="-0.02em"
        fontWeight="semibold"
        color="text.bold"
      >
        {props.title}
      </styled.h2>
      <styled.p mt="2" color="text.muted" fontSize="15px" maxW="60ch">
        {props.children}
      </styled.p>
    </Box>
  )
}

function count(n: number) {
  return String(n).padStart(2, "0")
}

export default async function TeamPage() {
  const listed = [...teamMembers, ...advisorMembers, ...alumniMembers]
    .map(getGithubLogin)
    .filter((login): login is string => Boolean(login))
  const contributors = await fetchContributors(listed)

  return (
    <Box>
      <TopNav />
      <Frame>
        <Pad>
          <Eyebrow mb="3">Team</Eyebrow>
          <Title as="h1">The people behind Zag</Title>
          <Lead mt="4">
            Zag.js is built in the open by a small team of maintainers, with
            help from advisors and contributors all over the world.
          </Lead>
        </Pad>

        <Band id="maintainers" scrollMarginTop="20">
          <GroupHeading
            label={`Maintainers · ${count(teamMembers.length)}`}
            title="Core team"
          >
            The maintainers and developer relations shaping Zag.js day to day.
          </GroupHeading>
          <styled.div
            className={grid}
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            }}
          >
            {teamMembers.map((member) => (
              <ProfileItem key={member.name} member={member} />
            ))}
          </styled.div>
        </Band>

        <Band id="advisors" scrollMarginTop="20">
          <GroupHeading
            label={`Advisors · ${count(advisorMembers.length)}`}
            title="Advisors"
          >
            People who shaped Zag.js and the work it stands on, but don&apos;t
            maintain it day to day.
          </GroupHeading>
          <styled.div
            className={grid}
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            }}
          >
            {advisorMembers.map((member) => (
              <ProfileItem key={member.name} member={member} />
            ))}
          </styled.div>
        </Band>

        <Band id="alumni" scrollMarginTop="20">
          <GroupHeading
            label={`Alumni · ${count(alumniMembers.length)}`}
            title="Past members"
          >
            Contributors whose work helped shape the project.
          </GroupHeading>
          <styled.div
            className={grid}
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            }}
          >
            {alumniMembers.map((member) => (
              <ProfileItem key={member.name} member={member} />
            ))}
          </styled.div>
        </Band>

        {contributors.length > 0 ? (
          <Band id="contributors" scrollMarginTop="20">
            <GroupHeading
              label={`Contributors · ${contributors.length}`}
              title="Everyone who has shipped code"
            >
              Every avatar here has landed a change in Zag.js.{" "}
              <styled.a
                href="https://github.com/chakra-ui/zag"
                target="_blank"
                rel="noopener noreferrer"
                color="text.bold"
                textDecoration="underline"
                textUnderlineOffset="2px"
              >
                Join them on GitHub
              </styled.a>
              .
            </GroupHeading>
            <styled.ul
              listStyle="none"
              display="flex"
              flexWrap="wrap"
              gap="2"
              px={{ base: "4", sm: "6", md: "10" }}
              pb={{ base: "12", md: "16" }}
            >
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
                    transition="opacity 120ms"
                    _hover={{ opacity: 0.7 }}
                    focusVisibleRing="outside"
                  >
                    <styled.img
                      src={`${person.avatar_url}&s=80`}
                      alt=""
                      loading="lazy"
                      boxSize="10"
                      rounded="full"
                      borderWidth="1px"
                      borderColor="border"
                      bg="bg.muted"
                    />
                  </styled.a>
                </li>
              ))}
            </styled.ul>
          </Band>
        ) : null}
        <Band />
      </Frame>
      <Footer />
    </Box>
  )
}
