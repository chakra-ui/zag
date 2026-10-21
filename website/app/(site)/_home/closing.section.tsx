"use client"

import { Box, styled } from "styled-system/jsx"
import { Ctas } from "./actions"
import { hCopy } from "./content"
import { gutter, StateLabel } from "./shared"

export function ClosingSection() {
  return (
    <Box
      borderTopWidth="1px"
      borderColor="border"
      px={gutter}
      py={{ base: "16", md: "28" }}
    >
      <StateLabel name={hCopy.closing.state} />
      <styled.h2
        mt="3"
        fontSize={{ base: "32px", md: "44px" }}
        lineHeight="1.1"
        letterSpacing="-0.035em"
        fontWeight="medium"
        color="text.bold"
        maxW="22ch"
        textWrap="balance"
      >
        {hCopy.closing.title}
      </styled.h2>
      <styled.p
        mt="4"
        fontSize={{ base: "17px", md: "20px" }}
        lineHeight="1.55"
        color="text.muted"
        maxW="52ch"
        textWrap="pretty"
      >
        {hCopy.closing.body}
      </styled.p>
      <Box mt="8">
        <Ctas />
      </Box>
    </Box>
  )
}
