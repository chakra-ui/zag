import { TwoToneHeading } from "components/ui/heading"
import {
  advisorMembers,
  alumniMembers,
  teamMembers,
  type TeamMember,
} from "lib/community"
import { fetchContributors } from "lib/contributors"
import { createPageMetadata } from "lib/seo"
import type { ReactNode } from "react"
import { Box } from "styled-system/jsx"
import { community, pageHeader, team } from "styled-system/recipes"
import { gutter } from "../_components/shared"
import { ProfileItem } from "./_components/profile-item"

export const metadata = createPageMetadata({
  title: "Team",
  description: "Meet the maintainers, advisors and contributors behind Zag.js.",
  path: "/team",
})

function githubLogin(member: TeamMember) {
  const href = member.links?.find((link) => link.label === "GitHub")?.href
  return href?.replace(/\/+$/, "").split("/").pop()
}

function Group(props: {
  id: string
  title: string
  lead: ReactNode
  members: TeamMember[]
}) {
  const styles = community()
  const grid = team()
  return (
    <section
      id={props.id}
      className={styles.section}
      aria-labelledby={`${props.id}-title`}
    >
      <div>
        <h2 id={`${props.id}-title`} className={styles.sectionTitle}>
          {props.title}
        </h2>
        <p className={styles.sectionLead}>{props.lead}</p>
      </div>
      <div className={grid.grid}>
        {props.members.map((member) => (
          <ProfileItem key={member.name} member={member} />
        ))}
      </div>
    </section>
  )
}

export default async function TeamPage() {
  const listed = [...teamMembers, ...advisorMembers, ...alumniMembers]
    .map(githubLogin)
    .filter((login): login is string => Boolean(login))
  const contributors = await fetchContributors(listed)
  const header = pageHeader()
  const styles = community()
  const wall = team()

  return (
    <Box maxW="1440px" mx="auto" px={gutter} pb="24">
      <header className={header.root}>
        <div className={header.copy}>
          <p className={header.eyebrow}>Team</p>
          <TwoToneHeading
            as="h1"
            title="The people behind Zag"
            accent="and everyone who ships it"
            size="display"
          />
          <p className={header.lead}>
            Zag is built in the open by a small team of maintainers, with help
            from advisors and contributors all over the world.
          </p>
        </div>
      </header>

      <Group
        id="maintainers"
        title="Core team"
        lead="The maintainers and developer relations shaping Zag day to day."
        members={teamMembers}
      />
      <Group
        id="advisors"
        title="Advisors"
        lead="People who shaped Zag and the work it stands on, but don't maintain it day to day."
        members={advisorMembers}
      />
      <Group
        id="alumni"
        title="Past members"
        lead="Contributors whose work helped shape the project."
        members={alumniMembers}
      />

      {contributors.length > 0 && (
        <section
          id="contributors"
          className={styles.section}
          aria-labelledby="contributors-title"
        >
          <div>
            <h2 id="contributors-title" className={styles.sectionTitle}>
              {contributors.length} people have shipped code
            </h2>
            <p className={styles.sectionLead}>
              Every avatar here has landed a change in Zag.{" "}
              <a
                href="https://github.com/chakra-ui/zag"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join them on GitHub ↗
              </a>
            </p>
          </div>
          <ul className={wall.wall}>
            {contributors.map((person) => (
              <li key={person.login}>
                <a
                  href={person.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={person.login}
                  aria-label={person.login}
                  className={wall.face}
                >
                  <img
                    src={`${person.avatar_url}&s=80`}
                    alt=""
                    loading="lazy"
                    width={40}
                    height={40}
                    className={wall.faceImg}
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Box>
  )
}
