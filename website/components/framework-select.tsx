import { HStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import { frameworks, type Framework } from "lib/framework-utils"
import { useRouter } from "next/router"
import { useFramework } from "./framework"

export function FrameworkSelect() {
  const { framework, setFramework } = useFramework()
  const { replace, asPath } = useRouter()

  return (
    <HStack>
      <chakra.label
        fontWeight="medium"
        htmlFor="framework-select"
        fontSize="sm"
      >
        Framework:{" "}
      </chakra.label>
      <chakra.select
        id="framework-select"
        fontSize="sm"
        fontWeight="semibold"
        color="text-primary-bold"
        defaultValue={framework}
        onChange={(event) => {
          const newFramework = event.currentTarget.value as Framework
          setFramework?.(newFramework)
          if (asPath.includes(framework) && newFramework !== framework) {
            const url = asPath.replace(framework, newFramework)
            replace(url)
          }
        }}
      >
        {Object.entries(frameworks).map(([key, value]) => (
          <option key={key} value={key}>
            {value.label}
          </option>
        ))}
      </chakra.select>
    </HStack>
  )
}
