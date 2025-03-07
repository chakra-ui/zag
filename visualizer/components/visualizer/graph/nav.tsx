import { HomeIcon } from "@/components/visualizer/controls/icons"

import { GithubIcon } from "@/components/visualizer/controls/icons"
import Link from "next/link"
import { useRouter } from "next/router"

export const Nav = () => {
  const {
    query: { component },
  } = useRouter()

  return (
    <div className="nav">
      <Link href="/">
        <HomeIcon />
      </Link>
      <Link
        href={`https://github.com/chakra-ui/zag/blob/main/packages/machines/${component}/src/${component}.machine.ts`}
        target="_blank"
      >
        <GithubIcon />
      </Link>
    </div>
  )
}
