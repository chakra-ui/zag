import Link from "next/link"
import { FaDiscord, FaGithub, FaXTwitter } from "react-icons/fa6"
import siteConfig from "site.config"
import { css } from "styled-system/css"
import { Box, Grid, HStack, Stack } from "styled-system/jsx"
import { Eyebrow } from "./lab/kit"
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
  fontSize: "14px",
  color: "text.muted",
  width: "fit-content",
  transition: "color 0.15s",
  _hover: { color: "text.bold" },
})

const grid = css({
  bg: "border",
  "& > *": { bg: "bg" },
})

const cellPadding = { base: "6", md: "8" }

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
  return (
    <Box
      as="footer"
      maxW="8xl"
      mx="auto"
      mt="-1px"
      position="relative"
      borderXWidth={{ base: "0", xl: "1px" }}
      borderTopWidth="1px"
      borderColor="border"
    >
      <Grid
        className={grid}
        gap="1px"
        gridTemplateColumns={{
          base: "repeat(2, minmax(0, 1fr))",
          lg: "1.6fr repeat(4, minmax(0, 1fr))",
        }}
      >
        <Stack
          gap="5"
          gridColumn={{ base: "1 / -1", lg: "auto" }}
          p={cellPadding}
        >
          <Link
            href="/"
            aria-label="Zag.js home"
            className={css({ width: "fit-content" })}
          >
            <Logo height="7" />
          </Link>
          <Box fontSize="14px" color="text.muted" maxW="18rem" lineHeight="1.6">
            {siteConfig.description}
          </Box>
          <HStack gap="1" color="text.muted" ms="-1.5">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  p: "1.5",
                  borderRadius: "sm",
                  _hover: { color: "text.bold", bg: "bg.muted" },
                })}
              >
                {social.icon}
              </a>
            ))}
          </HStack>
          <HStack gap="2" mt="auto" pt="2">
            <Box
              w="1.5"
              h="1.5"
              borderRadius="full"
              bg={{ _light: "green.600", _dark: "green.400" }}
              opacity="0.8"
            />
            <Eyebrow>v2 · MIT licensed</Eyebrow>
          </HStack>
        </Stack>

        {columns.map((column) => (
          <Stack key={column.title} gap="4" p={cellPadding}>
            <Eyebrow>{column.title}</Eyebrow>
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

      <HStack
        gap="6"
        justify="space-between"
        flexWrap={{ base: "wrap", md: "nowrap" }}
        px={cellPadding}
        py="5"
        borderTopWidth="1px"
        borderColor="border"
        fontSize="13px"
        color="text.muted"
      >
        <Box flexShrink="0">
          <Copyright />
        </Box>
        <Box flexShrink="0">
          <Credit />
        </Box>
      </HStack>
    </Box>
  )
}
