import { frameworks, type Framework } from "lib/framework-utils"
import { usePathname, useRouter } from "next/navigation"
import { HStack, styled } from "styled-system/jsx"
import { useFramework } from "./framework"

export function FrameworkSelect() {
  const { framework, setFramework } = useFramework()
  const router = useRouter()
  const asPath = usePathname()

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
            router.replace(url)
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
