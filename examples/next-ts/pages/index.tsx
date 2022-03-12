import Link from "next/link"

const IndexPage = () => {
  return (
    <div>
      <ul>
        <h2>React UI Machines</h2>
        <li>
          <Link href="/accordion"> To Accordion </Link>
        </li>
        <li>
          <Link href="/combobox"> To Combobox </Link>
        </li>
        <li>
          <Link href="/editable"> To Editable </Link>
        </li>
        <li>
          <Link href="/menu"> To Menu </Link>
        </li>
        <li>
          <Link href="/number-input"> To number input </Link>
        </li>
        <li>
          <Link href="/pin-input"> To pin input </Link>
        </li>
        <li>
          <Link href="/popover"> To popover </Link>
        </li>
        <li>
          <Link href="/range-slider"> To range slider </Link>
        </li>
        <li>
          <Link href="/rating"> To rating </Link>
        </li>
        <li>
          <Link href="/slider"> To slider </Link>
        </li>
        <li>
          <Link href="/tabs"> To tabs </Link>
        </li>
        <li>
          <Link href="/tags-input"> To tags input </Link>
        </li>
        <li>
          <Link href="/toast"> To toast </Link>
        </li>
        <li>
          <Link href="/tooltip"> To tooltip </Link>
        </li>
        <li>
          <Link href="/splitter"> To Splitter </Link>
        </li>
      </ul>
    </div>
  )
}

export default IndexPage
