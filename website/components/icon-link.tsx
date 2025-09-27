import { Icon } from "components/ui/icon"
import type { IconType } from "react-icons"
import { Box, styled } from "styled-system/jsx"

interface IconLinkProps {
  label: string
  href: string
  icon: IconType
}

export function IconLink(props: IconLinkProps) {
  const { label, href, icon } = props
  return (
    <styled.a
      width="6"
      height="6"
      display="flex"
      alignItems="center"
      justifyContent="center"
      href={href}
      target="_blank"
      color="gray.500"
      _hover={{ color: "gray.600" }}
    >
      <Box srOnly>{label}</Box>
      <Icon as={icon} fontSize="lg" color="gray.500" />
    </styled.a>
  )
}
