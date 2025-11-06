import { styled, HStack } from "styled-system/jsx"
import { frameworks, type Framework } from "lib/framework-utils"
import { useRouter } from "next/router"
import { useFramework } from "./framework"

export function FrameworkSelect() {
  const { framework, setFramework } = useFramework()
  const { replace, asPath } = useRouter()

  return (
    <HStack>
      <styled.label
        fontWeight="medium"
        htmlFor="framework-select"
        fontSize="sm"
      >
        Framework:{" "}
      </styled.label>
      <styled.select
        id="framework-select"
        fontSize="sm"
        fontWeight="semibold"
        color="text.primary.bold"
        defaultValue={framework}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
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
      </styled.select>
    </HStack>
  )
}
