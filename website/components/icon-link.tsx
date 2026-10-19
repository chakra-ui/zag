import { Icon } from "components/ui/icon"
import type { IconType } from "react-icons"
import { Box, styled } from "styled-system/jsx"

interface IconLinkProps extends React.ComponentProps<typeof StyledLink> {
  label: string
  icon: IconType
}

const StyledLink = styled("a", {
  base: {
    width: "8",
    height: "8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    rounded: "xs",
    _icon: {
      fill: "currentcolor",
    },
  },
  variants: {
    variant: {
      plain: {
        color: "text.muted",
        _hover: { color: "gray.600" },
      },
      solid: {
        borderWidth: "1px",
        borderColor: "border.bold",
        color: "text.bold",
        _hover: { bg: "bg.muted" },
      },
    },
  },
  defaultVariants: {
    variant: "plain",
  },
})

export function IconLink(props: IconLinkProps) {
  const { label, href, icon, ...rest } = props
  return (
    <StyledLink href={href} target="_blank" {...rest}>
      <Box srOnly>{label}</Box>
      <Icon as={icon} fontSize="lg" />
    </StyledLink>
  )
}
