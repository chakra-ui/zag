import { Footer } from "components/footer"
import { TopNav } from "components/nav/top-nav"

export default function SiteLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <main>{props.children}</main>
      <Footer />
    </>
  )
}
