import Icon from "@chakra-ui/icon"
import { Box, Center } from "@chakra-ui/layout"
import { useColorMode, useColorModeValue } from "@chakra-ui/system"
import { FaMoon, FaSun } from "react-icons/fa"

export function ThemeToggle() {
  const { toggleColorMode: toggleMode } = useColorMode()

  const text = useColorModeValue("dark", "light")
  const SwitchIcon = useColorModeValue(FaMoon, FaSun)

  return (
    <Center width="6" height="6" as="button" onClick={toggleMode}>
      <Box srOnly>{`Switch to ${text} mode`}</Box>
      <Icon as={SwitchIcon} fontSize="lg" color="gray.500" />
    </Center>
  )
}
