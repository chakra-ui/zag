import { Icon } from "components/ui/icon"
import type { IconType } from "react-icons"
import { HiCode, HiSparkles } from "react-icons/hi"
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
      <ResourceLink icon={HiSparkles} href={item.visualizeUrl} data-id="logic">
        Visualize Logic
      </ResourceLink>
      <ResourceLink icon={HiCode} href={item.sourceUrl} data-id="source">
        View Source
      </ResourceLink>
    </Wrap>
  )
}

const RiNpmjsFill: IconType = ({ size, color, ...rest }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill={color || "currentColor"}
    {...rest}
  >
    <path d="M2 14V9h20v5l-6-1v2l-6-2v-2l6 1v-1H2z" />
  </svg>
)
