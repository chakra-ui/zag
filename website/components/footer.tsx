import { Section } from "components/ui/section"
import { DiGithubBadge } from "react-icons/di"
import { FaDiscord } from "react-icons/fa"
import { IoLogoTwitter } from "react-icons/io"
import siteConfig from "site.config"
import { Stack } from "styled-system/jsx"
import { FooterLink, type FooterLinkProps } from "./footer-link"

const links: FooterLinkProps[] = [
  {
    icon: <DiGithubBadge size={40} />,
    label: "Zag.js on GitHub",
    href: siteConfig.repo.url,
  },
  {
    icon: <IoLogoTwitter size={20} />,
    label: "Zag.js on Twitter",
    href: "https://twitter.com/zag_js",
  },
  {
    icon: <FaDiscord size={20} />,
    label: "Join the Discord server",
    href: siteConfig.discord.url,
  },
]

export const Footer = () => (
  <Section
    as="footer"
    display="flex"
    justifyContent="space-between"
    flexDirection={{ base: "column", md: "row" }}
    gap="4"
    py="20"
  >
    <span dangerouslySetInnerHTML={{ __html: siteConfig.copyright }} />
    <span>
      A project by{" "}
      <a href="https://chakra-ui.com" target="_blank" rel="noopener noreferrer">
        Chakra Systems
      </a>
    </span>
    <Stack mt="4" direction="row" gap="3" justify="center">
      {links.map((link) => (
        <FooterLink key={link.href} {...link} />
      ))}
    </Stack>
  </Section>
)
