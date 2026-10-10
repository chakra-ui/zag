import Link from "next/link"
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6"
import siteConfig from "site.config"
import { css } from "styled-system/css"
import { Box, Grid, Stack } from "styled-system/jsx"
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
      { title: "Showcase", href: "/showcase" },
      { title: "Community", href: "/community" },
      { title: "Changelog", href: `${siteConfig.repo.blobUrl}/CHANGELOG.md` },
    ],
  },
]

const socials = [
  { icon: <FaGithub />, href: siteConfig.repo.url, label: "GitHub" },
  { icon: <FaDiscord />, href: siteConfig.discord.url, label: "Discord" },
  { icon: <FaXTwitter />, href: "https://x.com/zag_js", label: "X" },
]

const linkStyles = css({
  textStyle: "sm",
  color: "text.muted",
  transition: "color 0.15s",
  _hover: { color: "text" },
})

const eyebrow = css({
  fontSize: "xs",
  fontWeight: "semibold",
  textTransform: "uppercase",
  letterSpacing: "wide",
  color: "text.subtle",
})

function FooterLink(props: { href: string; children: React.ReactNode }) {
  const external = props.href.startsWith("http")
  return external ? (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkStyles}
    >
      {props.children}
    </a>
  ) : (
    <Link href={props.href} className={linkStyles}>
      {props.children}
    </Link>
  )
}

export function FooterCredits() {
  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap="4"
      justifyContent="space-between"
      textStyle="sm"
      color="text.subtle"
    >
      <span dangerouslySetInnerHTML={{ __html: siteConfig.copyright }} />
      <span>
        A project by{" "}
        <a
          href="https://chakra-ui.com"
          target="_blank"
          rel="noopener noreferrer"
          className={css({ _hover: { color: "text" } })}
        >
          Chakra Systems
        </a>
      </span>
    </Box>
  )
}

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.subtle" mt="20">
      <Box maxW="8xl" mx="auto" px={{ base: "4", sm: "6", md: "8" }} py="12">
        <Grid
          gap="10"
          gridTemplateColumns={{
            base: "repeat(2, minmax(0, 1fr))",
            lg: "1.5fr repeat(4, minmax(0, 1fr))",
          }}
        >
          <Stack gap="4" gridColumn={{ base: "1 / -1", lg: "auto" }}>
            <Link
              href="/"
              aria-label="Zag.js home"
              className={css({ width: "fit-content" })}
            >
              <Logo height="7" />
            </Link>
            <Box
              textStyle="sm"
              color="text.muted"
              maxW="16rem"
              lineHeight="1.6"
            >
              {siteConfig.description}
            </Box>
            <Box display="flex" gap="3" color="text.subtle">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={css({ p: "1", _hover: { color: "text" } })}
                >
                  {social.icon}
                </a>
              ))}
            </Box>
          </Stack>

          {columns.map((column) => (
            <Stack key={column.title} gap="3">
              <span className={eyebrow}>{column.title}</span>
              <Stack gap="2.5">
                {column.links.map((link) => (
                  <FooterLink key={link.title} href={link.href}>
                    {link.title}
                  </FooterLink>
                ))}
              </Stack>
            </Stack>
          ))}
        </Grid>

        <Box mt="14" pt="6" borderTopWidth="1px" borderColor="border.subtle">
          <FooterCredits />
        </Box>
      </Box>
    </Box>
  )
}
