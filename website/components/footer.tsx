import Link from "next/link"
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6"
import siteConfig from "site.config"
import { css } from "styled-system/css"
import { Box } from "styled-system/jsx"
import { siteFooter } from "styled-system/recipes"
import { Logo } from "./logo"

interface FooterColumn {
  title: string
  links: { title: string; href: string }[]
}

const columns: FooterColumn[] = [
  {
    title: "Docs",
    links: [
      { title: "Introduction", href: "/overview/introduction" },
      { title: "Installation", href: "/overview/installation" },
      { title: "All components", href: "/overview/components" },
      { title: "All utilities", href: "/overview/utilities" },
    ],
  },
  {
    title: "Learn",
    links: [
      { title: "Styling", href: "/guides/styling" },
      { title: "Building machines", href: "/guides/building-machines" },
      { title: "Migrating to v2", href: "/guides/migration" },
      { title: "LLMs.txt", href: "/overview/llms-txt" },
    ],
  },
  {
    title: "Community",
    links: [
      { title: "Discord", href: siteConfig.discord.url },
      { title: "GitHub", href: siteConfig.repo.url },
      { title: "X (Twitter)", href: "https://x.com/zag_js" },
      { title: "Sponsor", href: siteConfig.openCollective.url },
    ],
  },
  {
    title: "Project",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "RSS", href: "/blog/rss.xml" },
      { title: "Showcase", href: "/showcase" },
      { title: "Community", href: "/community" },
      { title: "Team", href: "/team" },
      { title: "Brand", href: "/brand" },
      { title: "Changelog", href: `${siteConfig.repo.blobUrl}/CHANGELOG.md` },
    ],
  },
]

const socials = [
  { icon: <FaGithub />, href: siteConfig.repo.url, label: "GitHub" },
  { icon: <FaDiscord />, href: siteConfig.discord.url, label: "Discord" },
  { icon: <FaXTwitter />, href: "https://x.com/zag_js", label: "X" },
]

function FooterLink(props: { href: string; children: React.ReactNode }) {
  const { link } = siteFooter()
  return props.href.startsWith("http") ? (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className={link}
    >
      {props.children}
    </a>
  ) : (
    <Link href={props.href} className={link}>
      {props.children}
    </Link>
  )
}

function Copyright() {
  return <span dangerouslySetInnerHTML={{ __html: siteConfig.copyright }} />
}

function Credit() {
  return (
    <span>
      A project by{" "}
      <a
        href="https://chakra-ui.com"
        target="_blank"
        rel="noopener noreferrer"
        className={css({ color: "text", _hover: { color: "text.bold" } })}
      >
        Chakra Systems
      </a>
    </span>
  )
}

export function FooterCredits() {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      gap="4"
      justifyContent="space-between"
      fontSize="13px"
      color="text.muted"
    >
      <Copyright />
      <Credit />
    </Box>
  )
}

export function Footer() {
  const styles = siteFooter()
  return (
    <footer className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div>
              <Link
                href="/"
                aria-label="Zag.js home"
                className={css({ display: "block", w: "fit-content" })}
              >
                <Logo height="7" />
              </Link>
              <p className={styles.description}>{siteConfig.description}</p>
              <div className={styles.socials}>
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.social}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
            <p className={styles.license}>
              <span className={styles.dot} />
              v2 · MIT licensed
            </p>
          </div>
          {columns.map((column) => (
            <nav
              key={column.title}
              aria-label={column.title}
              className={styles.column}
            >
              <p className={styles.heading}>{column.title}</p>
              {column.links.map((link) => (
                <FooterLink key={link.title} href={link.href}>
                  {link.title}
                </FooterLink>
              ))}
            </nav>
          ))}
        </div>
        <div className={styles.credits}>
          <Copyright />
          <span>
            A project by{" "}
            <a
              href="https://chakra-ui.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.credit}
            >
              Chakra Systems
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
