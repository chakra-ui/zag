import Icon, { IconProps } from "@chakra-ui/icon"
import { Link } from "@chakra-ui/layout"
import React from "react"

export type FooterLinkProps = {
  icon?: React.ElementType
  href?: string
  label?: string
  fontSize?: IconProps["fontSize"]
}

export function FooterLink(props: FooterLinkProps) {
  const { icon, href, label, fontSize = "xl" } = props
  return (
    <Link
      display="inline-flex"
      boxSize="6"
      justifyContent="center"
      alignItems="center"
      href={href}
      aria-label={label}
      isExternal
    >
      <Icon as={icon} fontSize={fontSize} color="gray.400" />
    </Link>
  )
}
