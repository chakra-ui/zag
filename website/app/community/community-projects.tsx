import type { CommunityProject } from "lib/community"
import { LuArrowUpRight } from "react-icons/lu"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

function ProjectRow({ project }: { project: CommunityProject }) {
  return (
    <HStack
      as="li"
      gap="4"
      alignItems="flex-start"
      py="5"
      borderTopWidth="1px"
      borderColor="border.subtle"
      _first={{ borderTopWidth: "0" }}
    >
      <Box
        boxSize="10"
        flexShrink="0"
        rounded="lg"
        display="grid"
        placeItems="center"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.subtle"
      >
        <styled.img src={project.logo} alt="" boxSize="6" objectFit="contain" />
      </Box>
      <Stack gap="1.5" flex="1" minW="0">
        <HStack gap="2" flexWrap="wrap" rowGap="1">
          <styled.span fontWeight="semibold" wordBreak="break-word">
            {project.name}
          </styled.span>
          {project.framework ? (
            <styled.span
              fontSize="xs"
              fontWeight="medium"
              px="2"
              py="0.5"
              rounded="full"
              bg="bg.muted"
              color="fg.muted"
            >
              {project.framework}
            </styled.span>
          ) : null}
        </HStack>
        <styled.p fontSize="sm" color="fg.muted" maxW="65ch">
          {project.description}
        </styled.p>
        <styled.span fontSize="xs" color="fg.subtle">
          by{" "}
          <styled.a
            href={`https://github.com/${project.author}`}
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: "fg" }}
          >
            {project.author}
          </styled.a>
        </styled.span>
      </Stack>
      <styled.a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${project.name}`}
        flexShrink="0"
        display="inline-flex"
        alignItems="center"
        gap="1.5"
        h="8"
        px="3"
        rounded="md"
        borderWidth="1px"
        borderColor="border.subtle"
        fontSize="xs"
        fontWeight="medium"
        _hover={{ bg: "bg.subtle", borderColor: "border.emphasized" }}
        _focusVisible={{
          outline: "2px solid",
          outlineColor: "green.500",
          outlineOffset: "2px",
        }}
      >
        Visit <LuArrowUpRight />
      </styled.a>
    </HStack>
  )
}

export function CommunityProjects(props: { projects: CommunityProject[] }) {
  return (
    <styled.ul listStyle="none">
      {props.projects.map((project) => (
        <ProjectRow key={project.name} project={project} />
      ))}
    </styled.ul>
  )
}
