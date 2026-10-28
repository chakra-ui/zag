import { TwoToneHeading } from "components/ui/heading"
import { communityLinks, communityProjects, recordings } from "lib/community"
import { getCommunityStats } from "lib/community-stats"
import { formatCompact } from "lib/format-number"
import { createPageMetadata } from "lib/seo"
import Image from "next/image"
import { FaDiscord, FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { Box, Grid, styled } from "styled-system/jsx"
import {
  button,
  community,
  pageHeader,
  showcaseCard,
} from "styled-system/recipes"
import { gutter } from "../_components/shared"

export const metadata = createPageMetadata({
  title: "Community",
  description:
    "Connect with the Zag.js community, watch recordings, and discover ecosystem projects.",
  path: "/community",
})

const icons = {
  discord: FaDiscord,
  github: FaGithub,
  x: FaXTwitter,
  youtube: FaYoutube,
}

const addPackageHref =
  "https://github.com/chakra-ui/zag/issues/new?title=Add%20community%20project%3A%20"

export default async function CommunityPage() {
  const stats = await getCommunityStats()
  const header = pageHeader()
  const styles = community()
  const card = showcaseCard()
  const title = stats
    ? `Made by ${formatCompact(stats.contributors)} contributors`
    : "Made by its contributors"

  return (
    <Box maxW="1440px" mx="auto" px={gutter} pb="24">
      <header className={header.root}>
        <div className={header.copy}>
          <p className={header.eyebrow}>Community</p>
          <TwoToneHeading
            as="h1"
            title={title}
            accent="and the people building on top"
            size="display"
          />
          <p className={header.lead}>
            Ask a question, share what you made, or pick up an issue. Packages
            built by the community live here too.
          </p>
        </div>
      </header>

      <nav aria-label="Join the community" className={styles.channels}>
        {communityLinks.map((link) => {
          const Icon = icons[link.icon]
          return (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.channel}
            >
              <Icon className={styles.icon} data-icon={link.icon} aria-hidden />
              <span className={styles.channelTitle}>{link.title}</span>
              <span className={styles.channelBody}>{link.description}</span>
              <span className={styles.cta} data-part="cta">
                {link.cta} →
              </span>
            </a>
          )
        })}
      </nav>

      <section className={styles.section} aria-labelledby="packages">
        <div className={styles.sectionHead}>
          <div>
            <h2 id="packages" className={styles.sectionTitle}>
              Community packages
            </h2>
            <p className={styles.sectionLead}>
              Adapters and components the core team doesn&apos;t maintain, but
              likes.
            </p>
          </div>
          <a
            href={addPackageHref}
            target="_blank"
            rel="noopener noreferrer"
            className={button()}
          >
            Add your package →
          </a>
        </div>
        <Grid columns={{ base: 1, sm: 2, lg: 3 }} gap="5">
          {communityProjects.map((project) => (
            <a
              key={project.href}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className={card.root}
            >
              <Box
                className={card.media}
                data-part="media"
                h="150px"
                flex="none"
              >
                <Image
                  src={project.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "contain", padding: "20px 70px" }}
                />
              </Box>
              <div className={card.body}>
                <div className={card.text}>
                  <Box display="flex" justifyContent="space-between" gap="3">
                    <h3 className={card.name}>
                      <styled.span fontFamily="mono" fontSize="14px">
                        {project.name}
                      </styled.span>
                    </h3>
                    <span className={styles.author}>@{project.author}</span>
                  </Box>
                  <p className={card.description}>{project.description}</p>
                </div>
              </div>
            </a>
          ))}
        </Grid>
      </section>

      <section
        id="recordings"
        className={styles.section}
        aria-labelledby="recordings-title"
      >
        <div>
          <h2 id="recordings-title" className={styles.sectionTitle}>
            Recordings
          </h2>
          <p className={styles.sectionLead}>
            Conversations with teams that build on Zag.
          </p>
        </div>
        <div className={styles.recordings}>
          {recordings.map((video) => (
            <a
              key={video.href}
              href={video.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.recording}
            >
              <span className={styles.play} data-part="play" aria-hidden>
                ▶
              </span>
              <span className={styles.recordingText}>
                <span className={styles.recordingTitle}>{video.title}</span>
                <span className={styles.recordingBody}>
                  {video.description}
                </span>
              </span>
              <span className={styles.duration}>
                {video.duration ?? "watch ↗"}
              </span>
            </a>
          ))}
        </div>
      </section>
    </Box>
  )
}
