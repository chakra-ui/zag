import type { ShowcaseItem } from "lib/showcase"
import Image from "next/image"
import { css } from "styled-system/css"
import { Box, Stack, styled } from "styled-system/jsx"

export function ShowcaseCard(props: {
  item: ShowcaseItem
  children?: React.ReactNode
}) {
  const { item } = props
  return (
    <styled.a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      display="block"
      overflow="hidden"
      rounded="lg"
      borderWidth="1px"
      borderColor="border.subtle"
      bg="bg.subtle"
      transition="all 0.2s"
      _hover={{
        borderColor: "border.emphasized",
        shadow: "sm",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "green.500",
        outlineOffset: "2px",
      }}
    >
      <Box position="relative" aspectRatio="16/9" overflow="hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover", objectPosition: "top center" }}
          className={css({
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
          })}
        />
      </Box>
      <Stack gap="0.5" p="4">
        <styled.h3 fontWeight="semibold" fontSize="sm">
          {item.name}
        </styled.h3>
        <styled.p fontSize="sm" color="fg.muted">
          {item.description}
        </styled.p>
        {props.children}
      </Stack>
    </styled.a>
  )
}
