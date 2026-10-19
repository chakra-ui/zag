import type { ShowcaseItem } from "lib/showcase"
import Image from "next/image"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

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
      display="flex"
      flexDirection="column"
      gap="5"
      p={{ base: "5", md: "6" }}
      bg="bg"
      transition="background 0.2s"
      className="group"
      _hover={{ bg: "bg.muted" }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "text.bold",
        outlineOffset: "-2px",
      }}
    >
      <Box
        position="relative"
        aspectRatio="16/10"
        overflow="hidden"
        rounded="md"
        borderWidth="1px"
        borderColor="border"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover", objectPosition: "top center" }}
          className={css({
            filter: "grayscale(1)",
            opacity: 0.85,
            transition: "filter 0.3s, opacity 0.3s",
            _groupHover: { filter: "grayscale(0)", opacity: 1 },
          })}
        />
      </Box>
      <Stack gap="1">
        <HStack justify="space-between">
          <styled.h3 fontWeight="semibold" fontSize="15px" color="text.bold">
            {item.name}
          </styled.h3>
          <styled.span fontFamily="mono" fontSize="12px" color="text.muted">
            ↗
          </styled.span>
        </HStack>
        <styled.p fontSize="14px" color="text.muted">
          {item.description}
        </styled.p>
        {props.children}
      </Stack>
    </styled.a>
  )
}
