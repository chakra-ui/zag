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
    display: "flex",
    alignItems: "center",
    gap: "1",
    borderWidth: "1px",
    px: "2",
    py: "1",
    fontSize: "sm",
    cursor: "pointer",
    bg: "bg",
  },
})

function ResourceLink(props: ResourceLinkProps) {
  const { href, icon, children, ...rest } = props
  return (
    <StyledLink href={href} target="_blank" {...rest}>
      <Icon as={icon} fontSize="lg" color="green.500" />
      <span>{children}</span>
    </StyledLink>
  )
}

//////////////////////////////////////////////////////////////////////////

interface ResourceLinkItem {
  npmUrl: string
  version: string
  visualizeUrl: string
  sourceUrl: string
}

interface ResourceLinkGroupProps {
  item: ResourceLinkItem
}

export function ResourceLinkGroup(props: ResourceLinkGroupProps) {
  const { item } = props
  return (
    <Wrap mt="6" columnGap="4">
      <ResourceLink icon={RiNpmjsFill} href={item.npmUrl} data-id="npm">
        {item.version} (latest)
      </ResourceLink>
      <ResourceLink icon={ImMagicWand} href={item.visualizeUrl} data-id="logic">
        Visualize Logic
      </ResourceLink>
      <ResourceLink icon={HiOutlineCode} href={item.sourceUrl} data-id="source">
        View Source
      </ResourceLink>
    </Wrap>
  )
}
