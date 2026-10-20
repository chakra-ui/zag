import { Icon } from "components/ui/icon"
import type { IconType } from "react-icons"
import { HiOutlineCode } from "react-icons/hi"
import { RiNpmjsFill } from "react-icons/ri"
import { ImMagicWand } from "react-icons/im"
import { styled, Wrap } from "styled-system/jsx"

interface ResourceLinkProps {
  href?: string | undefined
  icon: IconType
  children: any
}

const StyledLink = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1.5",
    h: "7",
    px: "2.5",
    borderWidth: "1px",
    borderColor: "border",
    rounded: "md",
    fontFamily: "mono",
    fontSize: "12px",
    letterSpacing: "0.02em",
    color: "text.muted",
    cursor: "pointer",
    bg: "bg",
    transition: "color 120ms, border-color 120ms",
    _hover: { color: "text.bold", borderColor: "border.bold" },
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "border.primary.bold",
      outlineOffset: "2px",
    },
  },
})

function ResourceLink(props: ResourceLinkProps) {
  const { href, icon, children, ...rest } = props
  return (
    <StyledLink href={href} target="_blank" {...rest}>
      <Icon as={icon} fontSize="14px" />
      <span>{children}</span>
    </StyledLink>
  )
}

//////////////////////////////////////////////////////////////////////////

interface ResourceLinkItem {
  npmUrl: string
  version: string
  visualizeUrl?: string
  sourceUrl: string
}

interface ResourceLinkGroupProps {
  item: ResourceLinkItem
}

export function ResourceLinkGroup(props: ResourceLinkGroupProps) {
  const { item } = props
  return (
    <Wrap mt="5" gap="2">
      <ResourceLink icon={RiNpmjsFill} href={item.npmUrl} data-id="npm">
        {item.version} (latest)
      </ResourceLink>
      {item.visualizeUrl ? (
        <ResourceLink
          icon={ImMagicWand}
          href={item.visualizeUrl}
          data-id="logic"
        >
          Visualize Logic
        </ResourceLink>
      ) : null}
      <ResourceLink icon={HiOutlineCode} href={item.sourceUrl} data-id="source">
        View Source
      </ResourceLink>
    </Wrap>
  )
}
