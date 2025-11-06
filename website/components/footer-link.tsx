import { styled } from "styled-system/jsx"

export type FooterLinkProps = {
  icon?: React.ReactElement
  href?: string
  label?: string
}

export function FooterLink(props: FooterLinkProps) {
  const { icon, href, label } = props
  return (
    <styled.a
      display="inline-flex"
      width="6"
      height="6"
      justifyContent="center"
      alignItems="center"
      href={href}
      aria-label={label}
      target="_blank"
      rel="noreferrer"
      color="gray.400"
      _hover={{ color: "gray.500" }}
    >
      {icon}
    </styled.a>
  )
}
