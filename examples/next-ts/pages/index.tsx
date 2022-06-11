import Link from "next/link"

const IndexPage = () => {
  return (
    <div className="index-nav">
      <h2>React UI Machines</h2>
      <ul>
        <li>
          <Link href="/accordion">Accordion </Link>
        </li>
        <li>
          <Link href="/combobox">Combobox </Link>
        </li>
        <li>
          <Link href="/editable">Editable </Link>
        </li>
        <li>
          <Link href="/dialog">Dialog </Link>
        </li>
        <li>
          <Link href="/dismissable">Dismissable </Link>
        </li>
        <li>
          <Link href="/menu">Menu </Link>
        </li>
        <li>
          <Link href="/nested-menu"> Nested menu </Link>
        </li>
        <li>
          <Link href="/menu-options"> Menu with Options </Link>
        </li>
        <li>
          <Link href="/context-menu">Context Menu </Link>
        </li>
        <li>
          <Link href="/number-input">number input </Link>
        </li>
        <li>
          <Link href="/pin-input">pin input </Link>
        </li>
        <li>
          <Link href="/popover">popover </Link>
        </li>
        <li>
          <Link href="/range-slider">range slider </Link>
        </li>
        <li>
          <Link href="/rating">rating </Link>
        </li>
        <li>
          <Link href="/slider">slider </Link>
        </li>
        <li>
          <Link href="/tabs">tabs </Link>
        </li>
        <li>
          <Link href="/tags-input">tags input </Link>
        </li>
        <li>
          <Link href="/toast">toast </Link>
        </li>
        <li>
          <Link href="/tooltip">tooltip </Link>
        </li>
        <li>
          <Link href="/splitter">Splitter </Link>
        </li>
      </ul>
    </div>
  )
}

export default IndexPage
