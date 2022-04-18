import { RouterLink } from "vue-router"
import { h, Fragment } from "vue"

export default function Page() {
  return (
    <div class="index-nav">
      <h2>Vue UI Machines</h2>
      <ul>
        <li>
          <RouterLink to="/accordion">Accordion </RouterLink>
        </li>
        <li>
          <RouterLink to="/combobox">Combobox </RouterLink>
        </li>
        <li>
          <RouterLink to="/editable">Editable </RouterLink>
        </li>
        <li>
          <RouterLink to="/dialog">Dialog </RouterLink>
        </li>
        <li>
          <RouterLink to="/menu">Menu </RouterLink>
        </li>
        <li>
          <RouterLink to="/nested-menu">Nested Menu </RouterLink>
        </li>
        <li>
          <RouterLink to="/menu-options">Menu option </RouterLink>
        </li>
        <li>
          <RouterLink to="/context-menu">Context Menu </RouterLink>
        </li>
        <li>
          <RouterLink to="/number-input">number input </RouterLink>
        </li>
        <li>
          <RouterLink to="/pin-input">pin input </RouterLink>
        </li>
        <li>
          <RouterLink to="/popover">popover </RouterLink>
        </li>
        <li>
          <RouterLink to="/range-slider">range slider </RouterLink>
        </li>
        <li>
          <RouterLink to="/rating">rating </RouterLink>
        </li>
        <li>
          <RouterLink to="/slider">slider </RouterLink>
        </li>
        <li>
          <RouterLink to="/tabs">tabs </RouterLink>
        </li>
        <li>
          <RouterLink to="/tags-input">tags input </RouterLink>
        </li>
        <li>
          <RouterLink to="/toast">toast </RouterLink>
        </li>
        <li>
          <RouterLink to="/tooltip">tooltip </RouterLink>
        </li>
        <li>
          <RouterLink to="/splitter">Splitter </RouterLink>
        </li>
      </ul>
    </div>
  )
}
