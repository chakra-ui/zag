import { Section } from "components/ui/section"
import { DiGithubBadge } from "react-icons/di"
import { IoLogoLinkedin, IoLogoTwitter } from "react-icons/io"
import { MdEmail } from "react-icons/md"
import siteConfig from "site.config"
import { Box, Stack } from "styled-system/jsx"
import { FooterLink, type FooterLinkProps } from "./footer-link"

const links: FooterLinkProps[] = [
  {
    icon: <DiGithubBadge size={40} />,
    label: "Go to Segun's GitHub",
    href: siteConfig.author.github,
  },
  {
    icon: <IoLogoTwitter size={20} />,
    label: "Go to Segun's Twitter",
    href: siteConfig.author.twitter,
  },
  {
    icon: <IoLogoLinkedin size={20} />,
    label: "Go to Segun's LinkedIn",
    href: siteConfig.author.linkedin,
  },
  {
    icon: <MdEmail size={20} />,
    label: "Send email to Segun",
    href: `mailto:${siteConfig.author.email}`,
  },
]

export const Footer = () => (
  <Box as="footer">
    <Section
      as="div"
      justifyItems="space-between"
      flexDirection={{ base: "column", md: "row" }}
      gap="4"
      my="20"
    >
      <span dangerouslySetInnerHTML={{ __html: siteConfig.copyright }} />
      <span>
        A project by{" "}
        <a
          href="https://chakra-ui.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chakra Systems
        </a>
      </span>
      <Stack mt="4" direction="row" gap="3" justify="center">
        {links.map((link) => (
          <FooterLink key={link.href} {...link} />
        ))}
      </Stack>
    </Section>
  </Box>
)
