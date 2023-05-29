import Icon from "@chakra-ui/icon"
import { Box, Center } from "@chakra-ui/layout"
import { ElementType } from "react"

type IconLinkProps = {
  label: string
  href: string
  icon: ElementType
}

export function IconLink({ label, href, icon }: IconLinkProps) {
  return (
    <Center width="6" height="6" as="a" href={href} target="_blank">
      <Box srOnly>{label}</Box>
      <Icon as={icon} fontSize="lg" color="gray.500" />
    </Center>
  )
}
